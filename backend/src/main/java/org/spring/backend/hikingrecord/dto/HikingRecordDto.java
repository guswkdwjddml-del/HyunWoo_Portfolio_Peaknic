package org.spring.backend.hikingrecord.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// ============== 내등산기록 DTO ============== //
@Getter
@Builder
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HikingRecordDto {

  private Long recordId;
  private String mountainName;
  private String courseName;

  private Double actualDistance; // 내가 걸은 거리
  private Integer actualTime; // 실제 소요 시간
  private Double burnedCalories; // 소모 칼로리
  private Boolean isCompleted; // 완주 뱃지 출력용

  private LocalDateTime startTime;
  private LocalDateTime endTime;

  // 카카오맵에 사용자가 실제로 걸은 경로(파란 선)를 그리기 위한 위경도 리스트
  private List<TrackPointDto> userTrack;

}
