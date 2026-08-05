package org.spring.backend.crew.service;

import java.util.List;

import org.spring.backend.crew.dto.CrewScheduleDto;

public interface CrewScheduleService {

  // 크루 일정(상세) 목록
  public List<CrewScheduleDto> scheduleList(Long crewId);
  
  // 크루 일정 생성 (수정,삭제 없이 항상 덮어씌우기)
  public void saveSchedules(Long crewId, List<CrewScheduleDto> scheduleDtos);

}
