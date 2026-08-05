package org.spring.backend.common;

// 플랫폼 장부 거래 종류
public enum LedgerType { // yein 작성
  PAYMENT_RECEIVED,   // 크루원 결제 -> 우리 계좌 입금 (+)
  SUBSCRIBE_RECEIVED, // 구독권 결제 -> 우리 계좌 입금 (+)
  SETTLEMENT_PAYOUT,  // 크루장 정산 -> 우리 계좌 출금 (-)
  REFUND_PAYOUT,      // 크루원 또는 구독권 환불 -> 우리 계좌 출금 (-)
}
