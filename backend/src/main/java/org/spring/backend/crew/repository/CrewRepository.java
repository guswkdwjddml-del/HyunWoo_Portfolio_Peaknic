package org.spring.backend.crew.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.admin.dto.CrewCountDto;
import org.spring.backend.admin.dto.CrewStatusChartDto;
import org.spring.backend.crew.entity.CrewEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CrewRepository extends JpaRepository<CrewEntity, Long>, JpaSpecificationExecutor<CrewEntity>, CrewRepositoryCustom {
  List<CrewEntity> findByMemberEntityId(Long memberId);

  // yein - 인원 충족 & 모집 날짜 지남 -> CrewStatus CLOSED로 벌크 변경
  @Modifying
  @Query("""
          UPDATE CrewEntity c
          SET c.crewStatus = org.spring.backend.common.CrewStatus.CLOSED,
              c.recruitClosedAt = CURRENT_TIMESTAMP
          WHERE c.crewStatus = org.spring.backend.common.CrewStatus.RECRUITING
            AND c.crewDeadline <= CURRENT_TIMESTAMP
            AND c.currentPeople >= c.minPeople
      """)
  int changeCloseCrews();

  // yein - 인원 미달 & 모집 날짜 지남 -> 환불 대상 조회
  @Query("""
          SELECT c
          FROM CrewEntity c
          WHERE c.crewStatus = org.spring.backend.common.CrewStatus.RECRUITING
            AND c.crewDeadline <= CURRENT_TIMESTAMP
            AND c.currentPeople < c.minPeople
      """)
  List<CrewEntity> findRefundCrewsUnderMinPeople();

  List<CrewEntity> findAllByCrewStatusAndCrewEndDateBefore(CrewStatus closed, LocalDateTime now);

  // ============ 관리자페이지 모임관리용(추가_sun) ==============//
  // Dashboard 출력용
  @Query("""
        select new org.spring.backend.admin.dto.CrewCountDto(
            count(c),
            sum(case when c.crewStatus = 'RECRUITING' then 1 else 0 end),
            sum(case when c.crewStatus = 'CLOSED' then 1 else 0 end),
            sum(case when c.crewStatus = 'COMPLETED' then 1 else 0 end),
            sum(case when c.crewStatus = 'CANCELLED' then 1 else 0 end),
            sum(
                  case 
                  when c.crewStatus = 'COMPLETED'
                  and c.completedAt >= CURRENT_DATE
                  then 1 
                  else 0 
                  end
            )
        )
        from CrewEntity c
        """)
  CrewCountDto countCrewByStatus();

  @Query("""
        select c
        from CrewEntity c
        where c.crewStatus = 'CLOSED'
        and c.crewStartDate > CURRENT_DATE
        order by c.crewStartDate asc
        """)
  List<CrewEntity> findUpcomingCrews(Pageable pageable);

  @Query("""
        select new org.spring.backend.admin.dto.CrewStatusChartDto(
        c.crewStatus,
        count(c)
        )
        from CrewEntity c
        group by c.crewStatus
        """)
  List<CrewStatusChartDto> crewStatusChart();
  // ========================================================//

}
