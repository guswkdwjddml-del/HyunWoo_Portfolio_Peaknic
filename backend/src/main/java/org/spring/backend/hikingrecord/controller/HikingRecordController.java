package org.spring.backend.hikingrecord.controller;

import org.spring.backend.hikingrecord.dto.HikingRecordDto;
import org.spring.backend.hikingrecord.service.HikingRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class HikingRecordController {

  private final HikingRecordService recordService;

  // 1. 등산 시작
  // POST /api/records/start
  @PostMapping("/start")
  public ResponseEntity<Long> startHiking(@RequestBody StartRequest request) {
    Long recordId = recordService.startHiking(request.getMemberId(), request.getTrailId());
    return ResponseEntity.ok(recordId);
  }

  // 2. 실시간 GPS 좌표 추가
  // POST /api/records/1/points
  @PostMapping("/{recordId}/points")
  public ResponseEntity<String> addTrailPoint(
      @PathVariable("recordId") Long recordId,
      @RequestBody PointRequest request) {

    recordService.addTrailPoint(recordId, request.getLat(), request.getLon(), request.getAlt());
    return ResponseEntity.ok("좌표 저장 완료");
  }

  // 3. 등산 종료 및 요약 기록 반환
  // POST /api/records/1/finish
  @PostMapping("/{recordId}/finish")
  public ResponseEntity<HikingRecordDto> finishHiking(
      @PathVariable("recordId") Long recordId,
      @RequestBody FinishRequest request) {

    HikingRecordDto result = recordService.finishHiking(
        recordId,
        request.getDistance(),
        request.getCalories(),
        request.getIsCompleted());
    return ResponseEntity.ok(result);
  }

  // --- 클라이언트 요청을 받기 위한 Request DTO 클래스들 ---

  @Getter
  public static class StartRequest {
    private Long memberId;
    private Long trailId;
  }

  @Getter
  public static class PointRequest {
    private Double lat;
    private Double lon;
    private Double alt; // 고도 (없으면 null)
  }

  @Getter
  public static class FinishRequest {
    private Double distance;
    private Double calories;
    private Boolean isCompleted;
  }

}
