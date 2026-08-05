package org.spring.backend.payment.dto.kakaoPay;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class KakaoPayReadyRequestDto { // yein 작성

  // KakaoPay 결제 준비(ready) API 호출할 때 사용하는 파라미터
  // -> 카카오페이는 snake_case를 쓰므로 JsonProperty 사용

  private String cid; // 가맹점 코드

  @JsonProperty("partner_order_id")
  private String partnerOrderId; // 가맹점 주문번호

  @JsonProperty("partner_user_id")
  private String partnerUserId; // 가맹점 회원 id

  @JsonProperty("item_name")
  private String itemName; // 상품명

  private int quantity; // 상품 수량

  @JsonProperty("total_amount")
  private int totalAmount; // 상품 총액

  @JsonProperty("tax_free_amount")
  private int taxFreeAmount; // 상품 비과세 금액

  @JsonProperty("approval_url")
  private String approvalUrl; // 결제 성공시 redirect url

  @JsonProperty("cancel_url")
  private String cancelUrl; // 결제 취소 시 redirect url

  @JsonProperty("fail_url")
  private String failUrl; // 결제 실패 시 redirect url

}
