package org.spring.backend.trail.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// =========== 지도에서 등산코스를 조각내어 필요한 코스만 담기위한 DTO  ================= //
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCourseDto {
  private Long trailId;
  private Double length;
  private Integer time;
  private List<CoordinateDto> path;

}
