package org.spring.backend.trail.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.spring.backend.trail.dto.CoordinateDto;
import org.spring.backend.trail.dto.SubCourseDto;
import org.spring.backend.trail.dto.TrailResponseDto;
import org.spring.backend.trail.entity.TrailEntity;
import org.spring.backend.trail.repository.TrailRepository;
import org.spring.backend.trail.service.TrailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrailServiceImpl implements TrailService {

  private final ObjectMapper mapper = new ObjectMapper();
  private final TrailRepository trailRepository;

  @Override
  @Transactional
  public List<TrailResponseDto> getCoursesByMountainId(Long mountainId) {
    // 1. 산 ID로 등산로 리스트를 조회
    List<TrailEntity> trails = trailRepository.findByMountainId(mountainId);
    
    // 3. 코스명으로 그룹핑
    Map<String, List<TrailEntity>> groupedTrails = trails.stream()
        .collect(Collectors.groupingBy(TrailEntity::getCourseName));

    List<TrailResponseDto> result = new ArrayList<>();

    for (Map.Entry<String, List<TrailEntity>> entry : groupedTrails.entrySet()) {
      List<TrailEntity> parts = entry.getValue();

      double totalLen = 0.0;
      int totalTime = 0;
      List<SubCourseDto> subCourses = new ArrayList<>();

      for (TrailEntity part : parts) {
        double pLen = part.getCourseLength() != null ? part.getCourseLength() : 0.0;
        int pUp = part.getUpTime() != null ? part.getUpTime() : 0;
        int pDown = part.getDownTime() != null ? part.getDownTime() : 0;
        int pTime = pUp + pDown;

        totalLen += pLen;
        totalTime += pTime;

        subCourses.add(SubCourseDto.builder()
            .trailId(part.getId())
            .length(pLen)
            .time(pTime)
            .path(parseCoordinates(part.getCoordinates()))
            .build());
      }

      result.add(TrailResponseDto.builder()
          .trailId(parts.get(0).getId())
          .courseName(entry.getKey())
          .difficulty(parts.get(0).getDifficulty())
          .totalLength(totalLen)
          .estimatedTime(totalTime)
          .subCourses(subCourses)
          .build());
    }
    return result;
  }

  private List<CoordinateDto> parseCoordinates(String coordsStr) {
    List<CoordinateDto> list = new ArrayList<>();
    try {
      JsonNode node = mapper.readTree(coordsStr);
      extract(node, list);
    } catch (Exception e) {
    }
    return list;
  }

  private void extract(JsonNode node, List<CoordinateDto> list) {
    if (node.isArray()) {
      if (node.size() == 2 && node.get(0).isNumber()) {
        list.add(CoordinateDto.builder()
            .longitude(node.get(0).asDouble())
            .latitude(node.get(1).asDouble()).build());
      } else {
        for (JsonNode child : node)
          extract(child, list);
      }
    }
  }
}
