package org.spring.backend.crew.repository;

import java.util.List;

import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.entity.CrewScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrewScheduleRepository extends JpaRepository<CrewScheduleEntity, Long> {
    
    // 크루 ID로 조회하며 sortOrder 오름차순으로 정렬
    List<CrewScheduleEntity> findByCrewEntityIdOrderBySortOrderAsc(Long crewId);
    
    // 크루 ID로 해당 크루의 모든 일정 삭제 (수정 시 초기화 용도)
    void deleteByCrewEntityId(Long crewId);

    void deleteByCrewEntity(CrewEntity crew);
}
