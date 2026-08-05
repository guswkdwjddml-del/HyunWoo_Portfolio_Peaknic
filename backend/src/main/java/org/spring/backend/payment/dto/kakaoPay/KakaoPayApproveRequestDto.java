package org.spring.backend.payment.dto.kakaoPay;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class KakaoPayApproveRequestDto { // yein 작성

  // KakaoPay 결제 승인(approve) API 호출할 때 사용하는 파라미터
  // -> 카카오페이는 snake_case를 쓰므로 JsonProperty 사용

  private String cid; // 가맹점 코드

  private String tid; // 결제 고유번호, 결제 준비 API 응답에 포함

  // 가맹점 주문번호, 결제 준비 API 요청과 일치해야 함
  @JsonProperty("partner_order_id")
  private String partnerOrderId;

  // 가맹점 회원 id, 결제 준비 API 요청과 일치해야 함
  @JsonProperty("partner_user_id")
  private String partnerUserId;

  // 결제승인 요청을 인증하는 토큰
  // 사용자 결제 수단 선택 완료 시, approval_url로 redirection 해줄 때 query string으로 전달
  @JsonProperty("pg_token")
  private String pgToken;

}
