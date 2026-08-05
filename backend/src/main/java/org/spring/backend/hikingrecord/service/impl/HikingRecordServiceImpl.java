package org.spring.backend.hikingrecord.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.spring.backend.hikingrecord.dto.HikingRecordDto;
import org.spring.backend.hikingrecord.dto.TrackPointDto;
import org.spring.backend.hikingrecord.entity.HikingRecordEntity;
import org.spring.backend.hikingrecord.repository.HikingRecordRepository;
import org.spring.backend.hikingrecord.service.HikingRecordService;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.trail.entity.TrailEntity;
import org.spring.backend.trail.entity.TrailPointEntity;
import org.spring.backend.trail.repository.TrailPointRepository;
import org.spring.backend.trail.repository.TrailRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class HikingRecordServiceImpl implements HikingRecordService {

  private final HikingRecordRepository recordRepository;
  private final MemberRepository memberRepository;
  private final TrailPointRepository pointRepository;
  private final TrailRepository trailRepository;

  // 1. 등산 시작 버튼 클릭 시
  @Override
  @Transactional
  public Long startHiking(Long memberId, Long trailId) {
    TrailEntity trail = trailRepository.findById(trailId)
        .orElseThrow(() -> new IllegalArgumentException("코스가 존재하지 않습니다."));
        
    MemberEntity member = memberRepository.findById(memberId)
    .orElseThrow(()-> new IllegalArgumentException("회원이 없습니다."));

    HikingRecordEntity record = HikingRecordEntity.builder()
        .memberEntity(member)
        .trail(trail)
        .startTime(LocalDateTime.now())
        .isCompleted(false)
        .build();

    return recordRepository.save(record).getId();
  }

  // 2. 등산 중 실시간 GPS 좌표 수집 (프론트에서 주기적으로 호출)
  @Override
  @Transactional
  public void addTrailPoint(Long recordId, Double lat, Double lon, Double alt) {
    HikingRecordEntity record = recordRepository.findById(recordId)
        .orElseThrow(() -> new IllegalArgumentException("기록을 찾을 수 없습니다."));

    TrailPointEntity point = TrailPointEntity.builder()
        .hikingRecord(record)
        .latitude(lat)
        .longitude(lon)
        .altitude(alt)
        .recordedAt(LocalDateTime.now())
        .build();

    pointRepository.save(point);
  }

  // 3. 등산 종료 버튼 클릭 시 기록 마감 및 요약 DTO 반환
  @Override
  @Transactional
  public HikingRecordDto finishHiking(Long recordId, Double distance, Double calories, Boolean isCompleted) {
    HikingRecordEntity record = recordRepository.findById(recordId)
        .orElseThrow(() -> new IllegalArgumentException("기록을 찾을 수 없습니다."));

    // 시간 계산 (분 단위)
    LocalDateTime endTime = LocalDateTime.now();
    int timeSpent = (int) ChronoUnit.MINUTES.between(record.getStartTime(), endTime);

    // 엔티티 업데이트
    record.setEndTime(endTime);
    record.setTotalTime(timeSpent);
    record.setTotalDistance(distance);
    record.setCalories(calories);
    record.setIsCompleted(isCompleted);
    recordRepository.save(record);

    // 사용자가 걸은 모든 점 가져오기 (파란 선 그리기 용도)
    List<TrailPointEntity> points = pointRepository.findByHikingRecordIdOrderByRecordedAtAsc(recordId);
    List<TrackPointDto> userTrack = points.stream()
        .map(p -> TrackPointDto.builder()
            .lat(p.getLatitude())
            .lon(p.getLongitude())
            .time(p.getRecordedAt())
            .build())
        .collect(Collectors.toList());

    // DTO 반환
    return HikingRecordDto.builder()
        .recordId(record.getId())
        .mountainName(record.getTrail().getMountain().getMountainName())
        .courseName(record.getTrail().getCourseName())
        .actualDistance(distance)
        .actualTime(timeSpent)
        .burnedCalories(calories)
        .isCompleted(isCompleted)
        .startTime(record.getStartTime())
        .endTime(endTime)
        .userTrack(userTrack)
        .build();
  }

}
