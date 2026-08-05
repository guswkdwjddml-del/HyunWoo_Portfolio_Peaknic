package org.spring.backend.review.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.service.BoardService;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.mountain.dto.MountainDto;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.payment.repository.PaymentRepository;
import org.spring.backend.review.dto.ReviewWriteDto;
import org.spring.backend.review.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

  private final BoardService boardService;
  private final SecurityMemberUtil securityMemberUtil;
  private final PaymentItemRepository paymentItemRepository;
  private final PaymentRepository paymentRepository;

  // <리뷰 작성 가능한 회원 정보 조회>
  @Override
  public MemberDto reviewMemberInfo() {

    // 로그인 한 회원
    MemberEntity member = securityMemberUtil.getLoginMember();
    return MemberDto.toMemberDto(member);
  }

  // <리뷰 등록>
  // 실제 서비스는-> boardServiceImpl
  @Override
  @Transactional
  public void reviewWrite(BoardDto boardDto,
      ReviewWriteDto reviewWriteDto) throws IOException {

    boardDto.setCategory(BoardCategory.REVIEW);

    // 리뷰 작성 완료 처리용 결제 정보 조회
    PaymentItemEntity paymentItem = paymentItemRepository.findById(
        reviewWriteDto.getPaymentItemId())
        .orElseThrow(() -> new IllegalArgumentException("결제 정보 없음"));

    // PaymentItemEntity
    // ↓
    // CrewEntity
    // 크루 정보 가져오기
    CrewEntity crew = paymentItem.getCrewEntity();

    // 크루id
    boardDto.setCrewId(crew.getId());

    // 저장 실행
    boardService.boardsave(boardDto);

    // 리뷰 작성 완료 처리
    paymentItem.setReviewConfirmed(true);

  }

  // <리뷰 작성 가능한 산만 조회해서 가져옴-> 작성이 X >
  @Override
  @Transactional(readOnly = true)
  public List<ReviewWriteDto> reviewWriteMountainList() {

    // 로그인 한 회원
    MemberEntity member = securityMemberUtil.getLoginMember();

    // 결제 목록 조회
    List<PaymentEntity> payments = paymentRepository.findByMemberEntityIdOrderByCreateTimeDesc(member.getId());

    System.out.println("로그인 회원 id : " + member.getId());
    System.out.println("결제 개수 : " + payments.size());

    List<ReviewWriteDto> result = new ArrayList<>();

    // 회원 1명 : 같은 산 리뷰 중복 방지
    Set<Long> mountainIds = new HashSet<>();

    // 결제 목록 반복
    for (int i = 0; i < payments.size(); i++) {

      PaymentEntity payment = payments.get(i);

      // 결제 완료만 확인
      if (payment.getPaymentStatus() != PaymentStatus.FINISH) {
        continue;
      }

      List<PaymentItemEntity> paymentItems = payment.getPaymentItemEntities();

      for (int j = 0; j < paymentItems.size(); j++) {

        PaymentItemEntity item = paymentItems.get(j);

        CrewEntity crew = item.getCrewEntity();

        // 크루 종료 여부 확인
        if (crew.getCrewStatus() != CrewStatus.COMPLETED) {
          continue;
        }

        MountainEntity mountain = crew.getMountainEntity();

        // 종료 날짜 확인
        if (crew.getCrewEndDate() == null) {
          continue;
        }

        // 종료 후 7일 이내만 작성 가능
        if (crew.getCrewEndDate()
            .plusDays(7)
            .isBefore(LocalDateTime.now())) {

          continue;
        }

        // 이미 리뷰 작성 완료한 결제 제외
        if (item.isReviewConfirmed()) {
          continue;
        }

        // 같은 산 중복 제거
        if (mountainIds.add(mountain.getId())) {

          // 반환

          System.out.println("crewId = " + crew.getId());
          System.out.println("crewName = " + crew.getCrewName());
          ReviewWriteDto dto = ReviewWriteDto.builder()
              .memberId(member.getId())
              .userName(member.getUserName())
              .mountainId(mountain.getId())
              .mountainName(mountain.getMountainName())
              .paymentItemId(item.getId())
              .crewName(crew.getCrewName())
              .crewId(crew.getId()) 
              .build();

          result.add(dto);

          System.out.println(
              "작성 가능한 산 : "
                  + mountain.getMountainName()
                  + " / paymentItemId : "
                  + item.getId());
        }
      }
    }

    System.out.println(
        "최종 리뷰 작성 가능 개수 : "
            + result.size());

    return result;
  }
}
