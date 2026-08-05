package org.spring.backend.settlement.service;

import org.spring.backend.crew.entity.CrewEntity;

public interface SettlementService { // yein 작성

  // 정산 준비 -> 실제 정산 처리(원장 기록)은 관리자가 진행 => 스케쥴러에서 실행
  void settleReady(CrewEntity crewEntity);

  // 정산 완료 -> 관리자가 크루장에게 입금 -> 장부(Ledger) 기록
  void settleComplete(Long settlementId);

  // 크루 인원 미달시 전원 환불 -> 장부(Ledger) 기록 => 스케쥴러에서 실행
  void refundAll(CrewEntity crewEntity);

}
