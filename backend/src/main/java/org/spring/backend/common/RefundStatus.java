package org.spring.backend.common;

// 환불 상태
public enum RefundStatus { // yein 작성
  NONE,           // 환불 요청 없음
  REFUND,         // 환불 완료
  REFUND_FAILED   // 환불 실패 (재시도 대상)
}
