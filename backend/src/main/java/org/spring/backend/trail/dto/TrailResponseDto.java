package org.spring.backend.trail.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

//=================== 선택한 산의 코스리스트 DTO ======================//
@Getter
@Builder
public class TrailResponseDto {

    private Long trailId; // 대표 트레일 ID
    private String courseName; // 백운대 코스 등
    private String difficulty; // 상, 중, 하
    private Double totalLength; // 총 길이 (km)
    private Integer estimatedTime;// 상행 + 하행 합산 예상 시간(분)

    // 코스를 이루는 조각(구간)들의 리스트
    private List<SubCourseDto> subCourses;

}
