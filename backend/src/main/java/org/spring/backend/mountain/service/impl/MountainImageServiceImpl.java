package org.spring.backend.mountain.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.spring.backend.mountain.config.ForestApiClient;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.mountain.service.MountainImageService;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MountainImageServiceImpl implements MountainImageService {

  private final ForestApiClient apiClient;
  private final XmlMapper xmlMapper = new XmlMapper();
  private final MountainRepository mountainRepository;

  @Override
  public void updateMountainImage(MountainEntity mountain) {
    // 이미 DB에 이미지가 있다면 API를 찌를 필요 없이 바로 종료
    if (mountain.getImageUrl() != null && !mountain.getImageUrl().trim().isEmpty()) {
      return;
    }

    try {
      // mountain 객체에서 Long 타입의 mountainCode를 직접 꺼내서 사용합니다.
      String imgXml = apiClient.getMountainImageXml(mountain.getMountainCode());
      if (imgXml == null || imgXml.isEmpty()) {
        return;
      }
      JsonNode imgRoot = xmlMapper.readTree(imgXml);
      JsonNode item = imgRoot.path("body").path("items").path("item");
      if (item.isMissingNode()) {
        return;
      }
      JsonNode firstItem = item.isArray() ? item.get(0) : item;
      String fileName = firstItem.path("imgfilename").asText("");
      if (!fileName.isEmpty()) {
        mountain.setImageUrl("https://www.forest.go.kr/images/data/down/mountain/" + fileName);
      }
      // 공공데이터 API 차단 방지를 위한 0.5초 대기
      Thread.sleep(500);
    } catch (Exception e) {
      log.warn("이미지 조회 실패 : {}", mountain.getMountainName());
    }
  }

  // 2. 전체 산 이미지 수집 (DB에 저장된 산 코드 기준)
  @Override
  public void syncAllMountainImages() {
    log.info("--- [2단계] 산 이미지 전체 수집 시작 ---");

    // DB에서 이미지가 없는 산 목록 추출
    List<MountainEntity> mountainsNoImage = mountainRepository.findAll().stream()
        .filter(m -> m.getImageUrl() == null || m.getImageUrl().trim().isEmpty())
        .collect(Collectors.toList());

    for (MountainEntity mountain : mountainsNoImage) {
      try {
        this.updateMountainImage(mountain);
        mountainRepository.save(mountain);
        Thread.sleep(500); // API 차단 방지를 위한 0.5초 대기
      } catch (Exception e) {
        log.error("산 ID {} 이미지 수집 에러: {}", mountain.getId(), e.getMessage());
      }
    }
    log.info("--- [2단계] 산 이미지 수집 완료 ---");
  }
}