package org.spring.backend.common;

// 크루 상태
public enum CrewStatus {
  RECRUITING, // 모집 중
  CLOSED,     // 마감 (인원 충족)
  COMPLETED,  // 완료 (크루 활동 종료) -> 정산 진행
  DELETED,    // 삭제
  CANCELLED   // 취소 (인원 미달 / 모집 취소) -> 환불 처리
}
