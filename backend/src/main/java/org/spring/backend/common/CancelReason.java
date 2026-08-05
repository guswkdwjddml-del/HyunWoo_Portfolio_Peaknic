package org.spring.backend.common;

// 취소 사유
public enum CancelReason { // yein 작성
  HOST_CANCEL,      // 크루장 모집 취소 -> 전액 환불
  JUNIOR_CANCEL,    // 크루원 참여 취소 -> 시점별 차등 환불
  MIN_PEOPLE_CANCEL // 인원 미달 취소 -> 전액 환불
}
