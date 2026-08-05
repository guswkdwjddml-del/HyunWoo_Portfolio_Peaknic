package org.spring.backend.common;

// 구독 상태
public enum SubscribeStatus { // yein 작성
  READY,    // 결제 대기 <-> PaymentStatus.READY
  ACTIVE,   // 결제 승인 완료, 구독 기간
  EXPIRED,  // 구독 기간 만료 -> 스케쥴러
  CANCELLED // 결제 실패/취소/만료 -> PaymentStatus.FAILED/CANCELLED/EXPIRED
}
