package org.spring.backend.trail.dto;

import lombok.Builder;
import lombok.Getter;

// ============== 좌표 =======================//
@Getter
@Builder
public class CoordinateDto {
  private Double latitude;
  private Double longitude;
}
