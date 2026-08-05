package org.spring.backend.crew.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.spring.backend.crew.dto.CrewScheduleDto;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.entity.CrewScheduleEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.crew.repository.CrewScheduleRepository;
import org.spring.backend.crew.service.CrewScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class CrewScheduleServiceImpl implements CrewScheduleService{

  private final CrewScheduleRepository crewScheduleRepository;
  private final CrewRepository crewRepository;
  
  // ================= 크루 일정(상세) 목록 ====================== //
  @Override
  public List<CrewScheduleDto> scheduleList(Long crewId) {
    // 정렬된 상태로 엔티티 목록 가져오기
        List<CrewScheduleEntity> entities = crewScheduleRepository.findByCrewEntityIdOrderBySortOrderAsc(crewId);
        
        // Entity -> DTO 변환
        return entities.stream().map(entity -> 
            CrewScheduleDto.builder()
                .id(entity.getId())
                .crewId(entity.getCrewEntity().getId())
                .scheduleTime(entity.getScheduleTime())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .sortOrder(entity.getSortOrder())
                .build()
        ).collect(Collectors.toList());
  }

    // ================= 크루 일정 생성 ====================== //

  @Override
  public void saveSchedules(Long crewId, List<CrewScheduleDto> scheduleDtos) {
   CrewEntity crew = crewRepository.findById(crewId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

        // 기존 일정 싹 지우고 새로 덮어쓰기 (프론트 배열 동기화에 최적)
        // 개별 수정/삭제를 추적할 필요 없이 항상 최신 상태의 배열
        crewScheduleRepository.deleteByCrewEntityId(crewId);

        if (scheduleDtos != null && !scheduleDtos.isEmpty()) {
            List<CrewScheduleEntity> newEntities = scheduleDtos.stream().map(dto -> 
                CrewScheduleEntity.builder()
                    .scheduleTime(dto.getScheduleTime())
                    .title(dto.getTitle())
                    .description(dto.getDescription())
                    .sortOrder(dto.getSortOrder())
                    .crewEntity(crew)
                    .build()
            ).collect(Collectors.toList());

            // 일괄 저장
            crewScheduleRepository.saveAll(newEntities);
        }
  }

}
