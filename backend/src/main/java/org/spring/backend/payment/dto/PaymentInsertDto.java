package org.spring.backend.payment.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.PaymentType;

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
public class PaymentInsertDto { // yein 작성

  private List<Long> selectIds; // 선택한 장바구니 아이템만 결제

  private Long crewId; // 단건 결제 (crewDetail에서 바로)

  private PaymentType paymentType; // 결제 방법

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
