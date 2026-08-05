package org.spring.backend.trail.service;

import java.util.List;

import org.spring.backend.trail.dto.TrailResponseDto;


public interface TrailService {
    // 사용자용 코스경로 조회
    List<TrailResponseDto> getCoursesByMountainId(Long mountainId);
}
