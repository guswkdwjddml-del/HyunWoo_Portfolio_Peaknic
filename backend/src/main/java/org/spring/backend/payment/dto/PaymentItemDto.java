package org.spring.backend.payment.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.crew.dto.CrewFileDto;
import org.spring.backend.payment.entity.PaymentItemEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentItemDto { // yein 작성

  private Long id; // 아이디 (PK)

  private Long crewId; // 크루 아이디

  private int currentPrice; // 결제한 크루 참가비

  private String crewName; // 결제한 크루명

  private String mountainName; // 결제한 크루에서 가는 산 이름

  private LocalDateTime crewStartDate; // 결제한 크루 모임 시작 날짜

  private LocalDateTime crewEndDate; // 결제한 크루 모임 끝나는 날짜

  private String meetingPlace; // 결제한 크루 집합 장소

  private CrewStatus crewStatus; // 결제한 크루 상태 (COMPLETED 상태일 때 리뷰 버튼 출력)

  private List<CrewFileDto> crewFiles; // 크루 이미지 파일

  private boolean participationConfirmed; // 참여 확정 버튼 눌렀는지

  private boolean reviewConfirmed; // 리뷰 작성했는지

  private RefundStatus refundStatus; // 환불 상태

  private String mountainImageUrl; // 산 이미지 경로

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

  // ============ 관리자페이지 결제관리용(추가_sun) ==============//
  public static PaymentItemDto toPaymentItemDto(PaymentItemEntity paymentItemEntity) {
    if (paymentItemEntity == null)
      return null;
    return PaymentItemDto.builder()
        .id(paymentItemEntity.getId())
        .currentPrice(paymentItemEntity.getCurrentPrice())
        .crewName(paymentItemEntity.getCrewEntity().getCrewName())
        .mountainName(paymentItemEntity.getCrewEntity().getMountainEntity().getMountainName())
        .crewStartDate(paymentItemEntity.getCrewEntity().getCrewStartDate())
        .createTime(paymentItemEntity.getCreateTime())
        .updateTime(paymentItemEntity.getUpdateTime())
        .build();
  }
  // ========================================================//
}
