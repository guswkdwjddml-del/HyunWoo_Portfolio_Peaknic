package org.spring.backend.settlement.dto.kakaoPay;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class KakaoPayCancelRequestDto { // yein 작성

  // KakaoPay 결제 취소(cancel) API 호출할 때 사용하는 파라미터
  // -> 카카오페이는 snake_case를 쓰므로 JsonProperty 사용

  private String cid; // 가맹점 코드

  private String tid; // 결제 고유번호

  @JsonProperty("cancel_amount")
  private int cancelAmount; // 취소 금액

  @JsonProperty("cancel_tax_free_amount")
  private int cancelTaxFreeAmount; // 취소 비과세 금액

}
