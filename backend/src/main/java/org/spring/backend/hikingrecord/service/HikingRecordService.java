package org.spring.backend.hikingrecord.service;

import org.spring.backend.hikingrecord.dto.HikingRecordDto;

public interface HikingRecordService {

  Long startHiking(Long memberId, Long trailId);
    void addTrailPoint(Long recordId, Double lat, Double lon, Double alt);
    HikingRecordDto finishHiking(Long recordId, Double distance, Double calories, Boolean isCompleted);

}
