package org.spring.backend.payment.dto.kakaoPay;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoPayReadyResponseDto { // yein 작성

  // KakaoPay 결제 준비(ready) API 호출 후 응답 받을 때 사용하는 파라미터
  // -> 카카오페이는 snake_case를 쓰므로 JsonProperty 사용

  private String tid; // 결제 고유 번호

  // 요청한 클라이언트(Client)가 모바일 앱일 경우 카카오톡 결제 페이지 Redirect URL
  @JsonProperty("next_redirect_app_url")
  private String nextRedirectAppUrl;

  // 요청한 클라이언트가 모바일 웹일 경우 카카오톡 결제 페이지 Redirect URL
  @JsonProperty("next_redirect_mobile_url")
  private String nextRedirectMobileUrl;

  // 카카오톡으로 결제 요청 메시지(TMS)를 보내기 위한 사용자 정보 입력 화면 Redirect URL (PC 웹)
  @JsonProperty("next_redirect_pc_url")
  private String nextRedirectPcUrl;

  @JsonProperty("created_at")
  private LocalDateTime createdAt; // 결제 준비 요청 시간

}
