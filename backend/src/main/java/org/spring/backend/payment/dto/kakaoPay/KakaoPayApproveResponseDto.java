package org.spring.backend.payment.dto.kakaoPay;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoPayApproveResponseDto { // yein 작성

  // KakaoPay 결제 승인(approve) API 호출 후 응답 받을 때 사용하는 파라미터
  // -> 카카오페이는 snake_case를 쓰므로 JsonProperty 사용

  private String aid; // 요청 고유 번호 - 승인/취소가 구분된 결제번호

  private String tid; // 결제 고유 번호 - 승인/취소가 동일한 결제번호

  @JsonProperty("partner_order_id")
  private String partnerOrderId; // 가맹점 주문번호

  @JsonProperty("partner_user_id")
  private String partnerUserId; // 가맹점 회원 id

  @JsonProperty("payment_method_type")
  private String paymentMethodType; // 결제 수단, CARD 또는 MONEY 중 하나

  private Amount amount; // 결제 금액 정보

  @Getter
  @NoArgsConstructor
  public static class Amount {
    private int total; // 전체 결제 금액
  }

}
