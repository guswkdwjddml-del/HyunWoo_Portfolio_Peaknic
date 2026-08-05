package org.spring.backend.customcourse.service.impl;

import org.spring.backend.customcourse.dto.CustomCourseDto;
import org.spring.backend.customcourse.entity.CustomCourseEntity;
import org.spring.backend.customcourse.repository.CustomCourseRepository;
import org.spring.backend.customcourse.service.CustomCourseService;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.trail.entity.TrailEntity;
import org.spring.backend.trail.repository.TrailRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomCourseServiceImpl implements CustomCourseService {

  private final CustomCourseRepository repository;
  private final TrailRepository trailRepository;
  private final MemberRepository memberRepository;

  // 코스 생성
  @Override
  @Transactional
  public Long saveCustomCourse(CustomCourseDto dto) {
    // 1. 보안 컨텍스트에서 현재 로그인한 이메일 추출
    String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

    // 2. 이메일로 회원 조회
    MemberEntity member = memberRepository.findByUserEmail(currentEmail)
        .orElseThrow(() -> new IllegalArgumentException("로그인된 회원을 찾을 수 없습니다."));

    // 3. Trail 조회
    TrailEntity trail = null;
    if (dto.getTrailId() != null) {
      trail = trailRepository.findById(dto.getTrailId()).orElse(null);
    }

    CustomCourseEntity entity = CustomCourseEntity.builder()
        .mountainName(dto.getMountainName())
        .courseName(dto.getCourseName())
        .totalDistance(dto.getTotalDistance())
        .totalTime(dto.getTotalTime())
        .maxAltitude(dto.getMaxAltitude())
        .startLat(dto.getStartLat())
        .startLon(dto.getStartLon())
        .endLat(dto.getEndLat())
        .endLon(dto.getEndLon())
        .selectedPath(dto.getSelectedPath())
        .selectedSegments(dto.getSelectedSegments())
        .trailEntity(trail)
        .memberEntity(member)
        .build();
    // DB에 저장하고 생성된 ID를 반환합니다.
    repository.save(entity);
    return entity.getId();
  }

  // 코스수정
  @Override
  @Transactional
  public void updateCustomCourse(Long id, CustomCourseDto dto) {

    TrailEntity trail = trailRepository.findById(dto.getTrailId())
        .orElseThrow(() -> new IllegalArgumentException("등산로를 찾을 수 없습니다."));

    CustomCourseEntity entity = repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("해당 코스를 찾을 수 없습니다."));

    MemberEntity member = memberRepository.findById(dto.getMemberId())
        .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다. ID: " + dto.getMemberId()));

    CustomCourseEntity updated = CustomCourseEntity.builder()
        .id(entity.getId())
        .mountainName(dto.getMountainName())
        .courseName(dto.getCourseName())
        .totalDistance(dto.getTotalDistance())
        .totalTime(dto.getTotalTime())
        .maxAltitude(dto.getMaxAltitude())
        .startLat(dto.getStartLat())
        .startLon(dto.getStartLon())
        .endLat(dto.getEndLat())
        .endLon(dto.getEndLon())
        .selectedPath(dto.getSelectedPath())
        .selectedSegments(dto.getSelectedSegments())
        .trailEntity(trail)
        .memberEntity(member)
        .build();

    repository.save(updated);
  }

  // 코스 조회
  @Override
  @Transactional(readOnly = true)
  public CustomCourseDto getCustomCourseById(Long id) {
    CustomCourseEntity entity = repository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("해당 코스를 찾을 수 없습니다."));

    return CustomCourseDto.builder()
        .mountainName(entity.getMountainName())
        .courseName(entity.getCourseName())
        .totalDistance(entity.getTotalDistance())
        .totalTime(entity.getTotalTime())
        .maxAltitude(entity.getMaxAltitude())
        .startLat(entity.getStartLat())
        .startLon(entity.getStartLon())
        .endLat(entity.getEndLat())
        .endLon(entity.getEndLon())
        .selectedPath(entity.getSelectedPath()) // JSON 형태의 좌표 문자열
        .selectedSegments(entity.getSelectedSegments())
        .trailId(entity.getTrailEntity() != null ? entity.getTrailEntity().getId() : null) // null point error 방지
        .memberId(entity.getMemberEntity() != null ? entity.getMemberEntity().getId() : null) // //
        .build();
  }
}
