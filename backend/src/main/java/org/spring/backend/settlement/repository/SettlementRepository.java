package org.spring.backend.settlement.repository;

import java.util.Optional;

import org.spring.backend.admin.dto.SettlementCountDto;
import org.spring.backend.settlement.entity.SettlementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SettlementRepository extends JpaRepository<SettlementEntity, Long> { // yein 작성

  Optional<SettlementEntity> findByCrewEntityId(Long id);

  // =================== 관리자 Dashboard 출력용(추가_sun) ==================
  @Query("""
      select new org.spring.backend.admin.dto.SettlementCountDto(
          sum(case when s.settlementStatus = 'COMPLETED' then 1 else 0 end),
          sum(case when s.settlementStatus = 'PENDING' then 1 else 0 end)
      )
      from SettlementEntity s
      """)
  SettlementCountDto countSettlementSummary();

}
