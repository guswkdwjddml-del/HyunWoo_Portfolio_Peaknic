package org.spring.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentChartDto {

  private String date;

  // 해당 날짜 결제 건수
  private Long count;

  // 해당 날짜 결제 금액
  private Long amount;

}
