package org.spring.backend.payment.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.PaymentCategory;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.subscribe.dto.SubscribeDto;

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
public class PaymentDto { // yein 작성

  private Long id; // 아이디 (PK)

  private String orderNumber; // 주문 번호 (P + 날짜 + 랜덤UUID 6자리)

  private int totalPrice; // 총 결제 금액

  private PaymentType paymentType; // 결제 방법

  private PaymentStatus paymentStatus; // 결제 상태

  private Long memberId; // 회원 아이디

  private List<PaymentItemDto> paymentItemDtos; // 결제 상세 목록

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

  // ============ 관리자페이지 결제관리용(추가_sun) ==============//
  private PaymentCategory paymentCategory;
  private List<PaymentItemDto> paymentItems;
  private int paymentItemCount;
  private SubscribeDto subscribeInfo;

  public static PaymentDto toPaymentDto(PaymentEntity paymentEntity) {
    if (paymentEntity == null)
      return null;

    // PaymentItemDto(스트림 메서드로 변환해서 주입)
    List<PaymentItemDto> items = paymentEntity.getPaymentItemEntities() != null
        ? paymentEntity.getPaymentItemEntities().stream().map(PaymentItemDto::toPaymentItemDto).toList()
        : null;

    return PaymentDto.builder()
        .id(paymentEntity.getId())
        .paymentCategory(paymentEntity.getPaymentCategory())
        .totalPrice(paymentEntity.getTotalPrice())
        .paymentType(paymentEntity.getPaymentType())
        .paymentStatus(paymentEntity.getPaymentStatus())
        .memberId(paymentEntity.getMemberEntity().getId())
        .paymentItems(
            paymentEntity.getPaymentCategory() == PaymentCategory.CREW
                ? items
                : null)
        .paymentItemCount(
            paymentEntity.getPaymentItemEntities() != null
                ? paymentEntity.getPaymentItemEntities().size()
                : 0)
        .orderNumber(paymentEntity.getOrderNumber())
        .createTime(paymentEntity.getCreateTime())
        .updateTime(paymentEntity.getUpdateTime())
        .build();
  }
  // ========================================================//

}
