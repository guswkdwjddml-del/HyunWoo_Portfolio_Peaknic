package org.spring.backend.ledger.repository;

import org.spring.backend.ledger.entity.LedgerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LedgerRepository extends JpaRepository<LedgerEntity, Long> { // yein 작성

  // 현재 플랫폼 잔액 (전체 거래 금액 합)
  @Query("SELECT COALESCE(SUM(p.amount), 0) FROM LedgerEntity p")
  int getCurrentBalance();

}
