package org.spring.backend.crew.controller;

import java.util.List;

import org.spring.backend.crew.dto.CrewScheduleDto;
import org.spring.backend.crew.service.CrewScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crew-schedules")
@RequiredArgsConstructor
public class CrewScheduleController {

  private final CrewScheduleService crewScheduleService;

    // 특정 크루의 타임라인 조회 (디테일 페이지용)
    @GetMapping("/crew/{crewId}")
    public ResponseEntity<List<CrewScheduleDto>> getSchedules(@PathVariable("crewId") Long crewId) {
        List<CrewScheduleDto> result = crewScheduleService.scheduleList(crewId);
        return ResponseEntity.ok(result);
    }

    // 크루 일정 저장 (생성 시 배열 전송 용도)
    @PostMapping("/crew/{crewId}")
    public ResponseEntity<String> saveSchedules(
            @PathVariable("crewId") Long crewId, 
            @RequestBody List<CrewScheduleDto> scheduleDtos) {
        
        crewScheduleService.saveSchedules(crewId, scheduleDtos);
        return ResponseEntity.ok("일정이 성공적으로 저장되었습니다.");
    }

}
