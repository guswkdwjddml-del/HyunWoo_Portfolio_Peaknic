package org.spring.backend.hikingrecord.dto;

// ======================  사용자가 실제 걸은 경로(내 등산 기록 조회) 그리기위한 위경도 DTO ===================//
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ================== 등산로 좌표 ====================//
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackPointDto {

  private Double lat;
  private Double lon;
  private LocalDateTime time;

}
