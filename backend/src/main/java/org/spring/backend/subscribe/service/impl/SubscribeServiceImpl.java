package org.spring.backend.subscribe.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.spring.backend.common.LedgerType;
import org.spring.backend.common.PaymentCategory;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.common.Role;
import org.spring.backend.common.SubscribeStatus;
import org.spring.backend.common.SubscribeType;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.ledger.entity.LedgerEntity;
import org.spring.backend.ledger.repository.LedgerRepository;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.payment.dto.kakaoPay.KakaoPayApproveResponseDto;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.gateway.KakaoPayGateway;
import org.spring.backend.payment.repository.PaymentRepository;
import org.spring.backend.subscribe.dto.SubscribeDto;
import org.spring.backend.subscribe.dto.SubscribeInsertDto;
import org.spring.backend.subscribe.entity.SubscribeEntity;
import org.spring.backend.subscribe.repository.SubscribeRepository;
import org.spring.backend.subscribe.service.SubscribeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscribeServiceImpl implements SubscribeService { // yein 작성 -> 구독권 결제 전용

  private final LedgerRepository ledgerRepository;
  private final KakaoPayGateway kakaoPayGateway;
  private final SecurityMemberUtil securityMemberUtil; // 회원 정보 불러오기
  private final SubscribeRepository subscribeRepository;
  private final PaymentRepository paymentRepository;
  private final NotificationService notificationService;

  // 결제하기 -> 카카오페이(결제창 URL) / 그 외는 null 반환 => 장부 기록 (즉시 결제)
  @Override
  @Transactional
  public String subscribeInsert(SubscribeInsertDto subscribeInsertDto) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 이미 HOST인 회원은 구독권 추가 구매 불가
    if (memberEntity.getRole() == Role.HOST) {
      throw new IllegalStateException("이미 HOST 권한을 보유하고 있어 구독이 불가합니다.");
    }

    // 현재 구독 활성화(ACTIVE) 상태라면 재구독 막기
    if (subscribeRepository.existsByMemberEntityIdAndSubscribeStatus(memberEntity.getId(), SubscribeStatus.ACTIVE)) {
      throw new IllegalStateException("이미 활성화된 구독이 있어 재구독이 불가합니다.");
    }

    // 결제 방법이 KAKAO -> 카카오페이 전용 결제 내역 생성 함수로 이동
    if (subscribeInsertDto.getPaymentType() == PaymentType.KAKAO) {
      // 카카오페이 결제 전 READY 상태인 구독권 결제 내역 -> CANCELLED 상태로 변경 / 결제 상태는 EXPIRED로 변경
      expireReadySubscribe(memberEntity);

      // 카카오페이 결제 리다이렉트 URL 반환
      return startKakaoSubscribe(memberEntity, subscribeInsertDto.getSubscribeType());
    }

    // 결제 내역 생성
    PaymentEntity paymentEntity = paymentRepository.save(PaymentEntity.builder()
        .orderNumber(createOrderNumber())
        .totalPrice(subscribeInsertDto.getSubscribeType().getPrice())
        .paymentType(subscribeInsertDto.getPaymentType())
        .paymentStatus(PaymentStatus.FINISH)
        .memberEntity(memberEntity)
        .paymentCategory(PaymentCategory.SUBSCRIBE)
        .build());

    LocalDateTime now = LocalDateTime.now();

    // 구독 내역 생성
    subscribeRepository.save(SubscribeEntity.builder()
        .subscribeType(subscribeInsertDto.getSubscribeType())
        .price(subscribeInsertDto.getSubscribeType().getPrice())
        .subscribeStatus(SubscribeStatus.ACTIVE)
        .paidTime(now)
        .subscribeStartTime(now)
        .subscribeExpireTime(now.plusDays(subscribeInsertDto.getSubscribeType().getDays()))
        .memberEntity(memberEntity)
        .paymentEntity(paymentEntity)
        .build());

    // 회원 권한 HOST로 변경
    memberEntity.setRole(Role.HOST);

    // 플랫폼 장부에 저장
    ledgerRepository.save(LedgerEntity.builder()
        .ledgerType(LedgerType.SUBSCRIBE_RECEIVED)
        .amount(subscribeInsertDto.getSubscribeType().getPrice())
        .relatedPaymentId(paymentEntity.getId())
        .description("구독권 즉시 결제: " + paymentEntity.getOrderNumber())
        .build());

    // 결제 완료 후 알림 전송
    notificationService.sendPayment(memberEntity.getId(), "플랜 결제가 완료되었습니다.", "/payment/list?tab=SUBSCRIBE");

    return null;
  }

  // 카카오페이 결제 전 READY 상태인 구독권 결제 내역 -> CANCELLED 상태로 변경 / 결제 상태는 EXPIRED로 변경
  private void expireReadySubscribe(MemberEntity memberEntity) {
    List<SubscribeEntity> readySubscribes = subscribeRepository
        .findAllByMemberEntityIdAndSubscribeStatus(memberEntity.getId(), SubscribeStatus.READY);

    if (readySubscribes.isEmpty()) {
      return;
    }

    for (SubscribeEntity subscribeEntity : readySubscribes) {
      subscribeEntity.setSubscribeStatus(SubscribeStatus.CANCELLED);
      subscribeEntity.getPaymentEntity().setPaymentStatus(PaymentStatus.EXPIRED);
    }
  }

  // 카카오페이 전용 결제 내역 생성 & 카카오페이 결제 준비(ready) API 호출 -> tid 저장 및 리다이렉트 URL 반환
  // member.Role -> HOST 로 변경 => 승인 이후에 진행
  private String startKakaoSubscribe(MemberEntity memberEntity, SubscribeType subscribeType) {
    // 결제 내역 생성 -> 아직 승인 전이므로 READY 상태
    PaymentEntity paymentEntity = paymentRepository.save(PaymentEntity.builder()
        .orderNumber(createOrderNumber())
        .totalPrice(subscribeType.getPrice())
        .paymentType(PaymentType.KAKAO)
        .paymentStatus(PaymentStatus.READY)
        .memberEntity(memberEntity)
        .paymentCategory(PaymentCategory.SUBSCRIBE)
        .build());

    // 구독 내역 생성 -> 아직 결제 전이므로 READY 상태, 결제/구독시간은 결제 후에 생성
    subscribeRepository.save(SubscribeEntity.builder()
        .subscribeType(subscribeType)
        .price(subscribeType.getPrice())
        .subscribeStatus(SubscribeStatus.READY)
        .memberEntity(memberEntity)
        .paymentEntity(paymentEntity)
        .build());

    // 카카오페이 결제 준비(ready) API 호출 -> tid & 리다이렉트 URL 반환
    KakaoPayGateway.ReadyResult readyResult = kakaoPayGateway.ready(
        paymentEntity.getOrderNumber(), memberEntity.getId(),
        subscribeType.name(), subscribeType.getPrice(), "/subscribe");

    // 결제 고유 번호(tid) 저장
    paymentEntity.setTid(readyResult.tid());

    // 카카오페이 결제 리다이렉트 URL 반환
    return readyResult.redirectUrl();
  }

  // 카카오페이 결제 승인(approve) API 호출 => 장부 기록
  // 성공 -> 결제 상태 FINISH / 구독 상태 ACTIVE / 구독 기간 설정 / Role -> HOST / 장부 기록
  // 실패 -> 예외 처리 (트랜잭션 롤백)
  @Override
  @Transactional
  public void subscribeKakaoApprove(String orderNumber, String pgToken) {
    // 결제 DB에 해당 주문 번호가 있는지 확인
    PaymentEntity paymentEntity = paymentRepository.findByOrderNumber(orderNumber)
        .orElseThrow(() -> new IllegalArgumentException("주문 번호가 " + orderNumber + "인 주문 내역은 존재하지 않습니다."));

    // 구독 결제 승인 요청이 아닐 경우 예외 처리
    if (paymentEntity.getPaymentCategory() != PaymentCategory.SUBSCRIBE) {
      throw new IllegalArgumentException("구독 결제 승인 요청이 아닙니다.");
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

    // 해당 결제 건에 맞는 구독권 내역 불러오기
    SubscribeEntity subscribeEntity = subscribeRepository.findByPaymentEntityId(paymentEntity.getId())
        .orElseThrow(() -> new IllegalStateException("구독 정보가 존재하지 않습니다."));

    LocalDateTime now = LocalDateTime.now();

    // 구독 내역 추가
    subscribeEntity.setSubscribeStatus(SubscribeStatus.ACTIVE);
    subscribeEntity.setPaidTime(now);
    subscribeEntity.setSubscribeStartTime(now);
    subscribeEntity.setSubscribeExpireTime(now.plusDays(subscribeEntity.getSubscribeType().getDays()));

    // 회원 권한 HOST로 변경
    paymentEntity.getMemberEntity().setRole(Role.HOST);

    // 플랫폼 장부에 저장
    ledgerRepository.save(LedgerEntity.builder()
        .ledgerType(LedgerType.SUBSCRIBE_RECEIVED)
        .amount(subscribeEntity.getPrice())
        .relatedPaymentId(paymentEntity.getId())
        .description("구독권 카카오페이 결제: " + orderNumber)
        .build());

    // 결제 완료 후 알림 전송
    notificationService.sendPayment(paymentEntity.getMemberEntity().getId(),
        "플랜 결제가 완료되었습니다.", "/payment/list?tab=SUBSCRIBE");
  }

  // 카카오페이 결제 취소/실패 -> 결제 상태 & 구독 상태 변경
  @Override
  @Transactional
  public void subscribeKakaoCancelFail(String orderNumber, PaymentStatus resultStatus) {
    // 결제 DB에 해당 주문 번호가 있는지 확인
    PaymentEntity paymentEntity = paymentRepository.findByOrderNumber(orderNumber)
        .orElseThrow(() -> new IllegalArgumentException("주문 번호가 " + orderNumber + "인 주문 내역은 존재하지 않습니다."));

    // 구독권 결제 요청이 아닐 경우 예외 처리
    if (paymentEntity.getPaymentCategory() != PaymentCategory.SUBSCRIBE) {
      throw new IllegalArgumentException("구독권 결제 요청이 아닙니다.");
    }

    // 결제 상태 변경 (CANCELLED, FAILED)
    paymentEntity.setPaymentStatus(resultStatus);

    // 구독 상태 변경 (CANCELLED)
    subscribeRepository.findByPaymentEntityId(paymentEntity.getId())
        .ifPresent(subscribeEntity -> subscribeEntity.setSubscribeStatus(SubscribeStatus.CANCELLED));

    // 결제 취소/실패 후 알림 전송
    notificationService.sendPayment(paymentEntity.getMemberEntity().getId(),
        "플랜 결제가 취소되었습니다.", "/payment/list?tab=SUBSCRIBE");
  }

  // 구독 내역 출력 (구독 현황)
  @Override
  @Transactional(readOnly = true)
  public SubscribeDto subscribeDetail() {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 비로그인 상태일시 null값 에러 방지용 예외처리
    if (memberEntity == null) {
      throw new IllegalStateException("로그인이 필요합니다.");
    }

    // 구독 상태가 ACTIVE인 구독건수 가져오기 -> SubscribeDto / null 반환
    return subscribeRepository
        .findByMemberEntityIdAndSubscribeStatus(memberEntity.getId(), SubscribeStatus.ACTIVE)
        .map(subscribeEntity -> SubscribeDto.builder()
            .id(subscribeEntity.getId())
            .subscribeType(subscribeEntity.getSubscribeType())
            .price(subscribeEntity.getPrice())
            .subscribeStatus(subscribeEntity.getSubscribeStatus())
            .paidTime(subscribeEntity.getPaidTime())
            .subscribeStartTime(subscribeEntity.getSubscribeStartTime())
            .subscribeExpireTime(subscribeEntity.getSubscribeExpireTime())
            .orderNumber(subscribeEntity.getPaymentEntity().getOrderNumber())
            .createTime(subscribeEntity.getCreateTime())
            .updateTime(subscribeEntity.getUpdateTime())
            .build())
        .orElse(null);
  }

  // 구독 결제 내역 출력
  @Override
  @Transactional(readOnly = true)
  public Page<SubscribeDto> subscribeList(Pageable pageable) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 구독 결제 내역 가져오기 -> SubscribeDto 반환
    return subscribeRepository
        .findAllByMemberEntityIdAndPaymentEntityHiddenFalseOrderByCreateTimeDesc(memberEntity.getId(), pageable)
        .map(subscribeEntity -> SubscribeDto.builder()
            .id(subscribeEntity.getId())
            .subscribeType(subscribeEntity.getSubscribeType())
            .price(subscribeEntity.getPrice())
            .subscribeStatus(subscribeEntity.getSubscribeStatus())
            .paidTime(subscribeEntity.getPaidTime())
            .subscribeStartTime(subscribeEntity.getSubscribeStartTime())
            .subscribeExpireTime(subscribeEntity.getSubscribeExpireTime())
            .paymentId(subscribeEntity.getPaymentEntity().getId())
            .orderNumber(subscribeEntity.getPaymentEntity().getOrderNumber())
            .paymentType(subscribeEntity.getPaymentEntity().getPaymentType())
            .createTime(subscribeEntity.getCreateTime())
            .updateTime(subscribeEntity.getUpdateTime())
            .build());
  }

  // 주문 번호 생성 (S + 날짜 + UUID 6자리)
  private String createOrderNumber() {
    // 날짜 생성
    String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

    // UUID 생성
    String random = UUID.randomUUID()
        .toString()
        .replace("-", "")
        .substring(0, 6)
        .toUpperCase();

    return "S" + date + random;
  }

}
