package org.spring.backend.mountain.service.impl;

import java.util.List;

import org.spring.backend.mountain.config.ForestApiClient;
import org.spring.backend.mountain.dto.ForestMountainApiDto;
import org.spring.backend.mountain.dto.MountainResponseDto;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.mountain.service.MountainImportService;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MountainImportServiceImpl implements MountainImportService {

  private final MountainRepository mountainRepository;
  private final ForestApiClient apiClient;
  private final XmlMapper xmlMapper = new XmlMapper();

  @Override
  public void saveMountain(int page) throws Exception {

    // 1. 산림청 API에서 1페이지(100건) 가져오기
    String xml = apiClient.getMountainXml(page);
    MountainResponseDto response = xmlMapper.readValue(xml, MountainResponseDto.class);

    // 2. API 서버 응답 에러 방지 (데이터가 없거나 뻗었을 때)
    if (response.getBody() == null || response.getBody().getItems() == null) {
      log.error("❌ XML 파싱 실패 또는 산림청 데이터가 없습니다.");
      return;
    }
    List<ForestMountainApiDto> list = response.getBody().getItems().getItem();
    // 3. 마지막 페이지 도달 처리
    if (list == null || list.isEmpty()) {
      log.info("▶️ {} 페이지에는 더 이상 수집할 산 데이터가 없습니다.", page);
      return;
    }
    // 4. 가져온 100개의 데이터를 순회하며 DB와 동기화
    for (ForestMountainApiDto dto : list) {
      // DB에 같은 이름의 산이 있는지 검색 (없으면 빈 객체 생성)
      MountainEntity mountainEntity = mountainRepository.findByMountainCode(dto.getMountainCode()) // 1순위: 코드로 정확히 찾기
          .orElseGet(() -> new MountainEntity());
      Integer parsedHeight = parseHeight(dto.getHeight());
      String rawLocation = dto.getLocation();
      String[] location = parseLocation(rawLocation);
      String parsedSido = location[0];
      String parsedSigungu = location[1];
      // 산텍스트 정보 저장
      updateMountainText(
          mountainEntity,
          dto,
          parsedHeight,
          rawLocation,
          parsedSido,
          parsedSigungu);
      // DB 저장
      mountainRepository.save(mountainEntity);
    }
  }

  // 1. 전체 산 텍스트 정보 수집 (1~50페이지 순회)
  @Override
  public void syncAllMountainText() {
    log.info("--- [1단계] 산 기본 정보(텍스트) 전체 수집 시작 ---");
    for (int page = 1; page <= 50; page++) {
      try {
        // 기존에 만드신 XML 파싱 후 DB 저장 메서드 활용
        this.saveMountain(page);

        // 공공데이터포털 과부하 방지를 위한 0.5초 대기
        Thread.sleep(500);
      } catch (Exception e) {
        log.error("{} 페이지 텍스트 수집 에러: {}", page, e.getMessage());
      }
    }
    log.info("--- [1단계] 산 기본 정보 수집 완료 ---");
  }


  // ------------------------- 유틸 및 분리한 메서드 ------------------------------- //

  // 산기본 정보저장 메서드
  // mountainCode가 없는경우에만 api데이터 반영 (관리자 수정내용을 스케쥴러가 덮어쓰지 않기 위함)
  private void updateMountainText(
      MountainEntity mountain,
      ForestMountainApiDto dto,
      Integer height,
      String rawLocation,
      String sido,
      String sigungu) {

    if (mountain.getMountainCode() != null) {
      return;
    }
    mountain.setMountainCode(dto.getMountainCode());
    mountain.setMountainName(dto.getMountainName());
    mountain.setHeight(height);
    mountain.setLocation(rawLocation);
    mountain.setSido(sido);
    mountain.setSigungu(sigungu);
    mountain.setDescription(dto.getDescription());
    mountain.setManagement(dto.getManagement());
    mountain.setHundredReason(dto.getHundredReason());
    mountain.setRecommendCourse(dto.getRecommendCourse());
  }

  // 지역을 나누는 메서드
  private String[] parseLocation(String location) {
    String sido = "";
    String sigungu = "";

    if (location != null) {
      String[] tokens = location.split("\\s+");
      if (tokens.length > 0) {
        sido = tokens[0].substring(0, Math.min(2, tokens[0].length()));
      }
      if (tokens.length > 1) {
        sigungu = tokens[1];
      }
    }
    return new String[] { sido, sigungu };
  }

  // 높이 파싱하는 메서드
  private Integer parseHeight(String height) {
    if (height == null || height.trim().isEmpty()) {
      return 0;
    }
    try {
      return (int) Math.round(Double.parseDouble(height));
    } catch (NumberFormatException e) {
      return 0;
    }
  }

}
