package org.spring.backend.settlement.dto.kakaoPay;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class KakaoPayCancelResponseDto { // yein 작성

  // KakaoPay 결제 취소(cancel) API 호출 후 응답 받을 때 사용하는 파라미터
  // -> 카카오페이는 snake_case를 쓰므로 JsonProperty 사용

  private String tid; // 결제 고유번호

  private String status; // 결제 상태 ("CANCEL_PAYMENT")

  @JsonProperty("approved_cancel_amount")
  private ApprovedCancelAmount approvedCancelAmount; // 이번 요청으로 취소된 금액

  @JsonProperty("canceled_at")
  private LocalDateTime canceledAt; // 결제 취소 시각

  @Getter
  @NoArgsConstructor
  public static class ApprovedCancelAmount {
    private int total; // 취소된 전체 결제 금액
  }

}
