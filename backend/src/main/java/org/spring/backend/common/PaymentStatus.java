package org.spring.backend.common;

// 결제 상태
public enum PaymentStatus { // yein 작성
  READY,          // 카카오페이 준비 (승인 대기) -> EXPIRED
  FINISH,         // 결제 완료
  FAILED,         // 결제 실패
  CANCELLED,      // 결제 취소
  EXPIRED         // 결제 만료
}
