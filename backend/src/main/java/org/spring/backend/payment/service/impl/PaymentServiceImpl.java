package org.spring.backend.payment.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.spring.backend.cart.entity.CartItemEntity;
import org.spring.backend.cart.repository.CartItemRepository;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.LedgerType;
import org.spring.backend.common.PaymentCategory;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.crew.dto.CrewFileDto;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewFileRepository;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.crew.service.impl.CrewServiceImpl;
import org.spring.backend.ledger.entity.LedgerEntity;
import org.spring.backend.ledger.repository.LedgerRepository;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.payment.dto.PaymentDto;
import org.spring.backend.payment.dto.PaymentInsertDto;
import org.spring.backend.payment.dto.PaymentItemDto;
import org.spring.backend.payment.dto.kakaoPay.KakaoPayApproveResponseDto;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.gateway.KakaoPayGateway;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.payment.repository.PaymentRepository;
import org.spring.backend.payment.service.PaymentService;
import org.spring.backend.subscribe.dto.SubscribeDto;
import org.spring.backend.subscribe.entity.SubscribeEntity;
import org.spring.backend.subscribe.repository.SubscribeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService { // yein 작성 -> 크루 결제 전용

  private final CrewServiceImpl crewServiceImpl;
  private final CrewRepository crewRepository;
  private final PaymentRepository paymentRepository;
  private final PaymentItemRepository paymentItemRepository;
  private final CartItemRepository cartItemRepository;
  private final SecurityMemberUtil securityMemberUtil; // 회원 정보 불러오기
  private final LedgerRepository ledgerRepository;
  private final CrewFileRepository crewFileRepository;
  private final KakaoPayGateway kakaoPayGateway; // ready/approve API 호출
  private final NotificationService notificationService;
  private final SubscribeRepository subscribeRepository;

  // 결제 진행 -> 카카오페이(결제창 URL) / 그 외는 null 반환 => 장부 기록 (즉시 결제)
  @Override
  @Transactional
  public String paymentInsert(PaymentInsertDto paymentInsertDto) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 결제할 크루가 없을 경우 예외 처리
    if (paymentInsertDto.getCrewId() == null
        && (paymentInsertDto.getSelectIds() == null || paymentInsertDto.getSelectIds().isEmpty())) {
      throw new IllegalArgumentException("결제할 크루가 없습니다.");
    }

    // 단건 / 장바구니 결제 -> 결제할 크루 담을 때 사용
    List<CrewEntity> crewEntities;

    // 장바구니 결제 -> 장바구니 아이템 담을 때 사용
    List<CartItemEntity> cartItemEntities = null;

    if (paymentInsertDto.getCrewId() != null) {
      // === 1. 단건 결제 ===

      // 크루 있는지 확인
      CrewEntity crewEntity = crewRepository.findById(paymentInsertDto.getCrewId())
          .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

      // 단건 결제할 크루 담아두기
      crewEntities = List.of(crewEntity);
    } else {
      // === 2. 장바구니 결제 ===

      // 선택한 장바구니 아이템이 해당 회원의 것인지 확인
      cartItemEntities = cartItemRepository
          .findAllByIdInAndCartEntityMemberEntityId(paymentInsertDto.getSelectIds(), memberEntity.getId());
      if (paymentInsertDto.getSelectIds().size() != cartItemEntities.size()) {
        throw new IllegalArgumentException("장바구니에 없는 아이템이 선택됐습니다.");
      }

      // 장바구니 결제할 크루 담아두기
      crewEntities = cartItemEntities.stream().map(CartItemEntity::getCrewEntity).toList();
    }

    // 결제 전 예외 처리
    for (CrewEntity crewEntity : crewEntities) {
      // 크루장 본인의 크루는 결제할 수 없게 막음
      if (crewEntity.getMemberEntity().getId().equals(memberEntity.getId())) {
        throw new IllegalArgumentException(crewEntity.getCrewName() + " 크루는 본인이 개설한 크루라 결제가 불가합니다.");
      }

      // 모집 중 상태인 크루인지 확인
      if (crewEntity.getCrewStatus() != CrewStatus.RECRUITING) {
        throw new IllegalArgumentException(crewEntity.getCrewName() + " 크루는 현재 모집 중이지 않아 결제가 불가합니다.");
      }

      // 이미 결제한 크루인지 확인
      if (paymentItemRepository
          .existsByPaymentEntityMemberEntityIdAndCrewEntityIdAndPaymentEntityPaymentStatusAndRefundStatus(
              memberEntity.getId(), crewEntity.getId(), PaymentStatus.FINISH, RefundStatus.NONE)) {
        throw new IllegalArgumentException(crewEntity.getCrewName() + " 크루는 이미 결제하신 내역이 있어 추가 결제가 불가합니다.");
      }
    }

    // 총 금액 계산
    int totalPrice = crewEntities.stream().mapToInt(CrewEntity::getCrewPrice).sum();

    // 결제 방법이 KAKAO && 총 금액이 0원 초과일 경우 -> 카카오페이 전용 결제 내역 생성 함수로 이동
    if (paymentInsertDto.getPaymentType() == PaymentType.KAKAO && totalPrice > 0) {
      // 카카오페이 결제 전 READY 상태인 결제 내역 -> EXPIRED 상태로 변경
      expireReadyPayment(memberEntity);

      // 카카오페이 결제 리다이렉트 URL 반환
      return startKakaoPayment(memberEntity, crewEntities, totalPrice);
    }

    // 결제 내역 생성
    PaymentEntity paymentEntity = paymentRepository.save(PaymentEntity.builder()
        .orderNumber(createOrderNumber())
        .totalPrice(totalPrice)
        .paymentType(paymentInsertDto.getPaymentType())
        .paymentStatus(PaymentStatus.FINISH)
        .memberEntity(memberEntity)
        .paymentCategory(PaymentCategory.CREW)
        .build());

    // 결제 상세 내역 생성
    for (CrewEntity crewEntity : crewEntities) {
      // 참가 인원 증가
      crewServiceImpl.addParticipant(crewEntity.getId());

      // 결제 상세 내역 저장
      paymentItemRepository.save(PaymentItemEntity.builder()
          .currentPrice(crewEntity.getCrewPrice())
          .paymentEntity(paymentEntity)
          .crewEntity(crewEntity)
          .build());
    }

    // 플랫폼 장부에 저장
    ledgerRepository.save(LedgerEntity.builder()
        .ledgerType(LedgerType.PAYMENT_RECEIVED)
        .amount(totalPrice)
        .relatedPaymentId(paymentEntity.getId())
        .description("크루 즉시 결제: " + paymentEntity.getOrderNumber())
        .build());

    // 장바구니 결제 -> 결제 성공 후 장바구니에서 장바구니 아이템 삭제
    if (cartItemEntities != null) {
      cartItemRepository.deleteAllInBatch(cartItemEntities);
    }

    // 결제 완료 후 알림 전송
    notificationService.sendPayment(memberEntity.getId(), "크루 결제가 완료되었습니다.", "/payment/list?tab=CREW");

    return null;
  }

  // 카카오페이 결제 전 READY 상태인 크루 결제 내역 -> EXPIRED 상태로 변경
  private void expireReadyPayment(MemberEntity memberEntity) {
    List<PaymentEntity> readyPayments = paymentRepository
        .findByMemberEntityIdAndPaymentStatusAndPaymentTypeAndPaymentCategory(
            memberEntity.getId(), PaymentStatus.READY, PaymentType.KAKAO, PaymentCategory.CREW);

    if (readyPayments.isEmpty()) {
      return;
    }

    for (PaymentEntity paymentEntity : readyPayments) {
      paymentEntity.setPaymentStatus(PaymentStatus.EXPIRED);
    }
  }

  // 카카오페이 전용 결제 내역 생성 & 카카오페이 결제 준비(ready) API 호출 -> tid 저장 및 리다이렉트 URL 반환
  // -> 참가 인원 증가 / 장바구니 아이템 삭제 => 승인 이후에 진행
  private String startKakaoPayment(MemberEntity memberEntity, List<CrewEntity> crewEntities, int totalPrice) {
    // 결제 내역 생성 -> 아직 승인 전이므로 READY 상태
    PaymentEntity paymentEntity = paymentRepository.save(PaymentEntity.builder()
        .orderNumber(createOrderNumber())
        .totalPrice(totalPrice)
        .paymentType(PaymentType.KAKAO)
        .paymentStatus(PaymentStatus.READY)
        .memberEntity(memberEntity)
        .paymentCategory(PaymentCategory.CREW)
        .build());

    // 결제 상세 내역 생성 (선택한 장바구니 아이템 넣기)
    for (CrewEntity crewEntity : crewEntities) {
      // 결제 상세 내역 저장
      paymentItemRepository.save(PaymentItemEntity.builder()
          .currentPrice(crewEntity.getCrewPrice())
          .paymentEntity(paymentEntity)
          .crewEntity(crewEntity)
          .build());
    }

    // 대표 상품명 (00 외 N건)
    String itemName = createItemName(crewEntities);

    // 카카오페이 결제 준비(ready) API 호출 -> tid & 리다이렉트 URL 반환
    KakaoPayGateway.ReadyResult readyResult = kakaoPayGateway.ready(
        paymentEntity.getOrderNumber(), memberEntity.getId(), itemName, totalPrice, "/payment");

    // 결제 고유 번호(tid) 저장
    paymentEntity.setTid(readyResult.tid());

    // 카카오페이 결제 리다이렉트 URL 반환
    return readyResult.redirectUrl();
  }

  // 카카오페이 결제 승인(approve) API 호출 -> 장바구니 아이템(결제 승인된 크루) ID 반환 (프론트 장바구니 상태 정리용)
  // 성공 -> 결제 상태 FINISH / 참가 인원 증가 / 장바구니 아이템 삭제 / 장부 기록
  // 실패 -> 예외 처리 (트랜잭션 롤백)
  @Override
  @Transactional
  public List<Long> paymentKakaoApprove(String orderNumber, String pgToken) {
    // 결제 DB에 해당 주문 번호가 있는지 확인
    PaymentEntity paymentEntity = paymentRepository.findByOrderNumber(orderNumber)
        .orElseThrow(() -> new IllegalArgumentException("주문 번호가 " + orderNumber + "인 주문 내역은 존재하지 않습니다."));

    // 크루 결제 승인 요청이 아닐 경우 예외 처리
    if (paymentEntity.getPaymentCategory() != PaymentCategory.CREW) {
      throw new IllegalArgumentException("크루 결제 승인 요청이 아닙니다.");
    }

    // 결제 상태가 준비(READY)인지 확인
    if (paymentEntity.getPaymentStatus() != PaymentStatus.READY) {
      throw new IllegalStateException("현재 " + paymentEntity.getPaymentStatus() + " 상태라 결제 승인이 불가합니다.");
    }

    // 카카오페이 결제 승인 API 호출 후 받은 응답 객체(DTO) 저장
    KakaoPayApproveResponseDto responseDto = kakaoPayGateway.approve(
        paymentEntity.getTid(), orderNumber, paymentEntity.getMemberEntity().getId(), pgToken);

    // 카카오페이가 승인한 전체 결제 금액과 DB에 저장된 총 금액이 다르면 예외 처리
    if (responseDto.getAmount().getTotal() != paymentEntity.getTotalPrice()) {
      throw new IllegalStateException("결제 금액이 일치하지 않습니다.");
    }

    // 결제 승인 성공 처리 -> 결제 상태 변경
    paymentEntity.setPaymentStatus(PaymentStatus.FINISH);

    // 결제 승인된 결제 아이템 리스트
    List<PaymentItemEntity> paymentItemEntities = paymentItemRepository.findAllByPaymentEntityId(paymentEntity.getId());

    // 결제 승인된 크루 아이디 리스트
    List<Long> paymentCrewIds = new ArrayList<>();

    for (PaymentItemEntity paymentItem : paymentItemEntities) {
      CrewEntity crewEntity = paymentItem.getCrewEntity();

      // 크루 참가 인원 증가
      crewServiceImpl.addParticipant(crewEntity.getId());

      // 결제 승인된 크루 아이디 리스트에 추가
      paymentCrewIds.add(crewEntity.getId());
    }

    // 플랫폼 장부에 저장
    ledgerRepository.save(LedgerEntity.builder()
        .ledgerType(LedgerType.PAYMENT_RECEIVED)
        .amount(paymentEntity.getTotalPrice())
        .relatedPaymentId(paymentEntity.getId())
        .description("크루 카카오페이 결제: " + paymentEntity.getOrderNumber())
        .build());

    // 결제 승인된 크루 ID가 담긴 장바구니 아이템 내역 추출
    List<CartItemEntity> cartItemEntities = cartItemRepository
        .findAllByCartEntityMemberEntityIdAndCrewEntityIdIn(paymentEntity.getMemberEntity().getId(), paymentCrewIds);

    // 장바구니 아이템(결제 승인된 크루) ID 추출
    List<Long> cartItemIds = cartItemEntities.stream().map(CartItemEntity::getId).toList();

    // 결제 승인된 크루만 장바구니 아이템에서 삭제
    cartItemRepository.deleteAllByCartEntityMemberEntityIdAndCrewEntityIdIn(
        paymentEntity.getMemberEntity().getId(), paymentCrewIds);

    // 결제 완료 후 알림 전송
    notificationService.sendPayment(paymentEntity.getMemberEntity().getId(),
        "크루 결제가 완료되었습니다.", "/payment/list?tab=CREW");

    return cartItemIds;
  }

  // 카카오페이 결제 취소/실패 -> 결제 상태 변경
  @Override
  @Transactional
  public void paymentKakaoCancelFail(String orderNumber, PaymentStatus resultStatus) {
    // 결제 DB에 해당 주문 번호가 있는지 확인
    PaymentEntity paymentEntity = paymentRepository.findByOrderNumber(orderNumber)
        .orElseThrow(() -> new IllegalArgumentException("주문 번호가 " + orderNumber + "인 주문 내역은 존재하지 않습니다."));

    // 크루 결제 요청이 아닐 경우 예외 처리
    if (paymentEntity.getPaymentCategory() != PaymentCategory.CREW) {
      throw new IllegalArgumentException("크루 결제 요청이 아닙니다.");
    }

    // 결제 상태 변경 (CANCELLED, FAILED)
    paymentEntity.setPaymentStatus(resultStatus);

    // 결제 취소/실패 후 알림 전송
    if (resultStatus == PaymentStatus.CANCELLED) {
      notificationService.sendPayment(paymentEntity.getMemberEntity().getId(),
          "크루 결제가 취소되었습니다.", "/payment/list?tab=CREW");
    } else if (resultStatus == PaymentStatus.FAILED) {
      notificationService.sendPayment(paymentEntity.getMemberEntity().getId(),
          "크루 결제를 실패하였습니다.", "/payment/list?tab=CREW");
    }
  }

  // 결제 내역 리스트
  @Override
  @Transactional(readOnly = true)
  public Page<PaymentDto> paymentList(Pageable pageable) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 로그인 회원의 크루 결제 내역을 생성일 내림차순으로 정렬 (페이징, 숨김 X)
    Page<PaymentEntity> paymentPage = paymentRepository
        .findByMemberEntityIdAndPaymentCategoryAndHiddenFalseOrderByCreateTimeDesc(
            memberEntity.getId(), PaymentCategory.CREW, pageable);

    // 결제 내역 없으면 빈 Page 반환
    if (paymentPage.isEmpty()) {
      return Page.empty(pageable);
    }

    // 결제 내역에 저장된 크루 아이디 출력 (중복 제거)
    List<Long> crewIds = paymentPage.getContent().stream()
        // 결제 내역 리스트 안의 결제 상세 내역 리스트를 하나로 펼치기
        .flatMap(payment -> payment.getPaymentItemEntities().stream())
        .map(item -> item.getCrewEntity().getId())
        .distinct()
        .toList();

    // 크루 아이디 -> 파일 리스트 매핑
    Map<Long, List<CrewFileDto>> crewFilesMap = crewFileRepository.findAllByCrewEntityIdIn(crewIds).stream()
        // 같은 크루 아이디끼리 파일 리스트 묶기
        .collect(Collectors.groupingBy(
            file -> file.getCrewEntity().getId(),
            // CrewFileEntity -> CrewFileDto 타입 변경 후 리스트에 넣기
            Collectors.mapping(file -> CrewFileDto.builder().filePath(file.getFilePath()).build(),
                Collectors.toList())));

    // Page<PaymentEntity> 타입에서 Page<PaymentDto> 타입으로 변환
    return paymentPage.map(paymentEntity -> {
      PaymentDto paymentDto = PaymentDto.builder()
          .id(paymentEntity.getId())
          .orderNumber(paymentEntity.getOrderNumber())
          .totalPrice(paymentEntity.getTotalPrice())
          .paymentStatus(paymentEntity.getPaymentStatus())
          .createTime(paymentEntity.getCreateTime())
          .build();

      // PaymentItemEntity 타입에서 PaymentItemDto 타입으로 변환
      List<PaymentItemDto> paymentItemDtos = paymentEntity.getPaymentItemEntities().stream()
          .map(paymentItemEntity -> {
            CrewEntity crewEntity = paymentItemEntity.getCrewEntity();

            return PaymentItemDto.builder()
                .id(paymentItemEntity.getId())
                .crewId(crewEntity.getId())
                .crewName(crewEntity.getCrewName())
                .currentPrice(paymentItemEntity.getCurrentPrice())
                .crewEndDate(crewEntity.getCrewEndDate())
                .crewStatus(crewEntity.getCrewStatus())
                .mountainName(crewEntity.getMountainEntity().getMountainName())
                // true -> 크루 아이디에 맞는 파일 가져오기 or 빈 리스트 / false -> 빈 리스트
                .crewFiles(
                    crewEntity.isAttachFile() ? crewFilesMap.getOrDefault(crewEntity.getId(), List.of()) : List.of())
                .participationConfirmed(paymentItemEntity.isParticipationConfirmed())
                .reviewConfirmed(paymentItemEntity.isReviewConfirmed())
                .refundStatus(paymentItemEntity.getRefundStatus())
                .mountainImageUrl(crewEntity.getMountainEntity().getImageUrl())
                .build();
          }).toList();

      // 타입 변환한 결제 상세 내역을 결제 내역에 넣기
      paymentDto.setPaymentItemDtos(paymentItemDtos);

      return paymentDto;
    });
  }

  // 결제 상세 내역 출력
  @Override
  @Transactional(readOnly = true)
  public PaymentDto paymentDetail(String orderNumber) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 결제 내역 있는지 확인, 결제 내역 생성일 내림차순으로 정렬
    PaymentEntity paymentEntity = paymentRepository
        .findByOrderNumberAndMemberEntityIdOrderByCreateTimeDesc(orderNumber, memberEntity.getId())
        .orElseThrow(() -> new IllegalArgumentException("결제 내역이 존재하지 않습니다."));

    // 크루 결제가 아닐 경우 예외 처리
    if (paymentEntity.getPaymentCategory() != PaymentCategory.CREW) {
      throw new IllegalArgumentException("크루 결제 내역이 존재하지 않습니다.");
    }

    // 결제 상세 내역에 저장된 크루 아이디 출력 (중복 제거)
    List<Long> crewIds = paymentEntity.getPaymentItemEntities().stream()
        .map(item -> item.getCrewEntity().getId()).distinct().toList();

    // 크루 아이디 -> 파일 리스트 매핑
    Map<Long, List<CrewFileDto>> crewFilesMap = crewFileRepository.findAllByCrewEntityIdIn(crewIds).stream()
        // 같은 크루 아이디끼리 파일 리스트 묶기
        .collect(Collectors.groupingBy(
            file -> file.getCrewEntity().getId(),
            // CrewFileEntity -> CrewFileDto 타입 변경 후 리스트에 넣기
            Collectors.mapping(file -> CrewFileDto.builder().filePath(file.getFilePath()).build(),
                Collectors.toList())));

    // PaymentEntity 타입에서 PaymentDto 타입으로 변환
    PaymentDto paymentDto = PaymentDto.builder()
        .id(paymentEntity.getId())
        .orderNumber(paymentEntity.getOrderNumber())
        .totalPrice(paymentEntity.getTotalPrice())
        .paymentType(paymentEntity.getPaymentType())
        .paymentStatus(paymentEntity.getPaymentStatus())
        .createTime(paymentEntity.getCreateTime())
        .updateTime(paymentEntity.getUpdateTime())
        .build();

    // 반환할 PaymentItemDto 껍데기 생성
    List<PaymentItemDto> paymentItemDtos = new ArrayList<>();

    // PaymentItemEntity 타입에서 PaymentItemDto 타입으로 변환
    for (PaymentItemEntity paymentItemEntity : paymentEntity.getPaymentItemEntities()) {
      CrewEntity crewEntity = paymentItemEntity.getCrewEntity();

      PaymentItemDto paymentItemDto = PaymentItemDto.builder()
          .id(paymentItemEntity.getId())
          .crewId(crewEntity.getId())
          .currentPrice(paymentItemEntity.getCurrentPrice())
          .crewName(crewEntity.getCrewName())
          .mountainName(crewEntity.getMountainEntity().getMountainName())
          .crewStartDate(crewEntity.getCrewStartDate())
          .crewEndDate(crewEntity.getCrewEndDate())
          .meetingPlace(crewEntity.getMeetingPlace())
          .crewStatus(crewEntity.getCrewStatus())
          // true -> 크루 아이디에 맞는 파일 가져오기 or 빈 리스트 / false -> 빈 리스트
          .crewFiles(crewEntity.isAttachFile() ? crewFilesMap.getOrDefault(crewEntity.getId(), List.of()) : List.of())
          .participationConfirmed(paymentItemEntity.isParticipationConfirmed())
          .reviewConfirmed(paymentItemEntity.isReviewConfirmed())
          .refundStatus((paymentItemEntity.getRefundStatus()))
          .mountainImageUrl(crewEntity.getMountainEntity().getImageUrl())
          .build();

      paymentItemDtos.add(paymentItemDto);
    }

    // 타입 변환한 결제 상세 내역을 결제 내역에 넣기
    paymentDto.setPaymentItemDtos(paymentItemDtos);

    return paymentDto;
  }

  // 참여 확정
  @Override
  @Transactional
  public void confirmParticipation(Long paymentItemId) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 결제 상세 내역 있는지 확인
    PaymentItemEntity paymentItemEntity = paymentItemRepository.findById(paymentItemId)
        .orElseThrow(() -> new IllegalArgumentException("결제 상세 내역이 존재하지 않습니다."));

    // 본인의 결제 내역인지 확인
    if (!paymentItemEntity.getPaymentEntity().getMemberEntity().getId().equals(memberEntity.getId())) {
      throw new IllegalArgumentException("본인의 결제 내역만 확정할 수 있습니다.");
    }

    // 크루 활동이 끝난 뒤에만 누를 수 있게 -> CLOSED 상태 && crewEndDate이 현재 시간보다 이전
    if (paymentItemEntity.getCrewEntity().getCrewStatus() != CrewStatus.CLOSED
        || paymentItemEntity.getCrewEntity().getCrewEndDate().isAfter(LocalDateTime.now())) {
      throw new IllegalStateException("참여 확정 버튼은 크루 활동 종료 후에 누를 수 있습니다.");
    }

    // 참여 확정 및 누른 시간 기록
    paymentItemEntity.setParticipationConfirmed(true);
    paymentItemEntity.setConfirmedTime(LocalDateTime.now());

    // 참여 확정 후 알림 전송
    notificationService.sendPayment(memberEntity.getId(),
        paymentItemEntity.getCrewEntity().getCrewName() + " 크루 참여 확정이 완료되었습니다.", "/payment/list?tab=CREW");
  }

  // 결제 내역 삭제 (숨기기)
  @Override
  @Transactional
  public void paymentHidden(Long paymentId) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 결제 내역 있는지 확인
    PaymentEntity paymentEntity = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new IllegalArgumentException("결제 내역이 존재하지 않습니다."));

    // 본인의 결제 내역인지 확인
    if (!paymentEntity.getMemberEntity().getId().equals(memberEntity.getId())) {
      throw new IllegalArgumentException("본인의 결제 내역만 삭제할 수 있습니다.");
    }

    // 숨김 상태 변경
    paymentEntity.setHidden(true);
  }

  // 주문 번호 생성 (P + 날짜 + UUID 6자리)
  private String createOrderNumber() {
    // 날짜 생성
    String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

    // UUID 생성
    String random = UUID.randomUUID()
        .toString()
        .replace("-", "")
        .substring(0, 6)
        .toUpperCase();

    return "P" + date + random;
  }

  // 대표 상품명 생성 (00 외 N건)
  private String createItemName(List<CrewEntity> crewEntities) {
    String firstName = crewEntities.get(0).getCrewName();
    int count = crewEntities.size();
    return count > 1 ? firstName + " 외 " + (count - 1) + "건" : firstName;
  }

  // ============ 관리자페이지 결제관리용(추가_sun) ==============//
  @Override
  public Page<PaymentDto> paymentListAll(
      Pageable pageable,
      String subject,
      String search,
      String paymentCategory) {

    boolean isAll = "ALL".equals(paymentCategory);

    PaymentCategory category = null;
    if (!isAll && paymentCategory != null) {
      try {
        category = PaymentCategory.valueOf(paymentCategory);
      } catch (IllegalArgumentException e) {
        category = null;
      }
    }

    PaymentStatus paymentStatus = null;
    if ("paymentStatus".equals(subject) && search != null && !search.isBlank()) {
      try {
        paymentStatus = PaymentStatus.valueOf(search);
      } catch (IllegalArgumentException e) {
        paymentStatus = null; // Enum에 없는 값이 들어올 경우 안전하게 null 처리
      }
    }

    Page<PaymentEntity> paymentEntities = paymentRepository.searchPayment(
        isAll,
        category,
        subject,
        search,
        paymentStatus,
        pageable);

    return paymentEntities.map(PaymentDto::toPaymentDto);
  }

  // @Override
  // public PaymentDto paymentDetailAdmin(Long id) {
  // PaymentEntity paymentEntity = paymentRepository.findById(id)
  // .orElseThrow(() -> new IllegalStateException("조회할 결제건이 없습니다."));
  // return PaymentDto.toPaymentDto(paymentEntity);
  // }

  @Override
  public PaymentDto paymentDetailAdmin(Long id) {
    PaymentEntity paymentEntity = paymentRepository.findById(id)
        .orElseThrow(() -> new IllegalStateException("조회할 결제건이 없습니다."));

    PaymentDto paymentDto = PaymentDto.toPaymentDto(paymentEntity);

    // 구독권 결제인 경우
    if (paymentEntity.getPaymentCategory() == PaymentCategory.SUBSCRIBE) {

      SubscribeEntity subscribeEntity = subscribeRepository.findByPaymentEntity_Id(id);

      if (subscribeEntity != null) {

        SubscribeDto subscribeDto = SubscribeDto.builder()
            .id(subscribeEntity.getId())
            .subscribeType(subscribeEntity.getSubscribeType())
            .price(subscribeEntity.getPrice())
            .subscribeStatus(subscribeEntity.getSubscribeStatus())
            .paidTime(subscribeEntity.getPaidTime())
            .subscribeStartTime(subscribeEntity.getSubscribeStartTime())
            .subscribeExpireTime(subscribeEntity.getSubscribeExpireTime())
            .paymentId(id)
            .orderNumber(paymentEntity.getOrderNumber())
            .paymentType(paymentEntity.getPaymentType())
            .createTime(subscribeEntity.getCreateTime())
            .updateTime(subscribeEntity.getUpdateTime())
            .build();

        paymentDto.setSubscribeInfo(subscribeDto);
      }
    }

    return paymentDto;
  }

  // ========================================================//

}
