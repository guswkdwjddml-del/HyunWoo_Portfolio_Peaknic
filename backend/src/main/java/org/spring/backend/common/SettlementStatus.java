package org.spring.backend.common;

// 정산 상태
public enum SettlementStatus { // yein 작성
  PENDING,  // 정산 대상 -> 관리자 입금 전
  COMPLETED // 정산 완료 -> 관리자 입금 후 (크루장 계좌)
}
