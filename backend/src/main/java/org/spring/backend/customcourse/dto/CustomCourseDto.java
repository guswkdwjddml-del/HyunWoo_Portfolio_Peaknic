package org.spring.backend.customcourse.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CustomCourseDto {
  
  private String mountainName;    // 산이름
  private String courseName;      // 코스이름
  private Double totalDistance;   // 총 거리
  private Integer totalTime;      // 총 시간
  private Integer maxAltitude;    // 최고 고도
  private Double startLat;        // 시작 위도
  private Double startLon;        // 시작 경도
  private Double endLat;          // 끝 위도
  private Double endLon;          // 끝 경도
  private String selectedPath;    // JSON 형식의 문자열 그대로 받음
  private Long trailId;           // 지도에 그리기위함
  private String selectedSegments;  // 지도 그리기위함
  private Long memberId;
  private String userEmail;         // 프론트엔드에서 토큰넘겨받을때 사용
  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
