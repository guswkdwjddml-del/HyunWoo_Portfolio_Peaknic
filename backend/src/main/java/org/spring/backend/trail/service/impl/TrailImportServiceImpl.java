package org.spring.backend.trail.service.impl;

import java.net.URI;
import java.util.List;

import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.trail.entity.TrailEntity;
import org.spring.backend.trail.repository.TrailRepository;
import org.spring.backend.trail.service.TrailImportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrailImportServiceImpl implements TrailImportService {

  private final MountainRepository mountainRepository;
  private final TrailRepository trailRepository;
  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${api.vworld.key}")
  private String vworldKey;
  @Value("${api.vworld.domain}")
  private String vworldDomain;

  @Override
  @Transactional
  public String syncMountainFromVWorld(String mountainName) {
    try {
      String vworldSearchName = mountainName.split("_")[0].split("\\(")[0].trim();

      URI uri = UriComponentsBuilder.fromHttpUrl("https://api.vworld.kr/req/data")
          .queryParam("service", "data")
          .queryParam("request", "GetFeature")
          .queryParam("data", "LT_L_FRSTCLIMB")
          .queryParam("key", vworldKey)
          .queryParam("domain", vworldDomain)
          .queryParam("geomFilter", "BOX(124,33,132,43)")
          .queryParam("attrFilter", "mntn_nm:like:" + vworldSearchName)
          .queryParam("format", "json") // JSON 포맷 강제
          .queryParam("size", "1000")
          .build().encode().toUri();

      ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
      JsonNode rootNode = new ObjectMapper().readTree(response.getBody());
      JsonNode features = rootNode.path("response").path("result").path("featureCollection").path("features");

      if (features.isMissingNode() || features.isEmpty())
        return "데이터 없음";

      MountainEntity mountain = mountainRepository.findByMountainNameContaining(mountainName).stream().findFirst()
          .orElseGet(() -> mountainRepository.save(MountainEntity.builder().mountainName(mountainName).build()));

      boolean hasValidCoordinates = false; // 실제 좌표 검증 플래그

      for (JsonNode feature : features) {
        JsonNode props = feature.path("properties");
        String coordinates = feature.path("geometry").path("coordinates").toString();

        // 빈 껍데기가 아닌, 실제 좌표(coordinates)가 존재하는 경우에만 저장
        if (coordinates != null && !coordinates.trim().isEmpty() && !coordinates.trim().equals("[]")) {
          hasValidCoordinates = true;
          
          // mountain DB에서가져온 entity값을 trailEntity에게 전달
          TrailEntity trail = TrailEntity.builder()
              .mountain(mountain)
              .courseName(props.path("mntn_nm").asText("이름 없음") + " 코스")
              .courseLength(props.path("sec_len").asDouble(0.0) / 1000.0)
              .upTime(props.path("up_min").asInt(0))
              .downTime(props.path("down_min").asInt(0))
              .difficulty(props.path("cat_nam").asText("정보없음"))
              .coordinates(coordinates)
              .build();

          trailRepository.save(trail);
        }
      }
      // 등산로가 저장되었고, 아직 hasTrail이 false라면 true로 바꿈
      if (hasValidCoordinates && !mountain.isHasTrail()) {
        mountain.setHasTrail(true);
        // @Transactional이 붙어있으므로 별도의 save 없이도 자동 업데이트
        mountainRepository.save(mountain);  // 혹시나해서...
      }
      return "동기화 완료";
    } catch (Exception e) {
      log.error("VWorld API 오류", e);
      return "동기화 실패";
    }
  }

  // 모든 산을 순회하며 코스 데이터를 채워넣는 메서드 (컨트롤러/스케줄러 호출용)
  @Override
  public void syncAllTrails() {
    log.info("--- [3단계] VWorld 등산 코스 전체 수집 시작 ---");
    List<MountainEntity> allMountains = mountainRepository.findAll();

    for (MountainEntity mountain : allMountains) {
      try {
        this.syncMountainFromVWorld(mountain.getMountainName());
        Thread.sleep(1000); // API 차단 방지를 위해 1초 대기
      } catch (Exception e) {
        log.error("산 '{}' 등산 코스 수집 에러: {}", mountain.getMountainName(), e.getMessage());
      }
    }
    log.info("--- [3단계] 등산 코스 수집 완료 ---");
  }
}