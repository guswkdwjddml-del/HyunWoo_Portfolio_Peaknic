package org.spring.backend.mountain.config;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// ============ api 호출용 =================== //
// 서비스인데 위치가 애매해서 일단 config에 둠
@Service
@RequiredArgsConstructor
@Slf4j
public class ForestApiClient {

  @Value("${api.forest.service-key}")
  private String serviceKey;

  @Value("${api.vworld.key}")
  private String vworldKey;
  @Value("${api.vworld.domain}")
  private String vworldDomain;

  private final RestTemplate restTemplate = new RestTemplate();

  // 텍스트데이터 조회 API
  // 1. 산림청: 산 텍스트 데이터 (XML)
  public String getMountainXml(int page) {
    try {
      String urlString = "https://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoOpenAPI2"
          + "?serviceKey=" + serviceKey + "&pageNo=" + page + "&numOfRows=100";
      log.info("호출 URL : {}", urlString);
      return new String(restTemplate.getForObject(new URI(urlString), byte[].class), StandardCharsets.UTF_8);
    } catch (Exception e) {
      return null;
    }
  }

  // 2. 산림청: 산 이미지 데이터 (XML)
  public String getMountainImageXml(Long mntiListNo) {
    try {
      String urlString = "https://apis.data.go.kr/1400000/service/cultureInfoService2/mntInfoImgOpenAPI2"
          + "?serviceKey=" + serviceKey + "&mntiListNo=" + mntiListNo + "&pageNo=1&numOfRows=1";
      log.info("호출 URL : {}", urlString);
      return new String(restTemplate.getForObject(new URI(urlString), byte[].class), StandardCharsets.UTF_8);
    } catch (Exception e) {
      return null;
    }
  }

  // 3. VWORLD: 등산로 공간정보 좌표 데이터 (JSON)
  public String getVworldTrailJson(String mountainName) {
    try {
      String encodedName = URLEncoder.encode(mountainName, "UTF-8");
      // Vworld 등산로(LT_L_FRSTCLIMB) 검색 API
      String urlString = "https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LT_L_FRSTCLIMB"
          + "&key=" + vworldKey
          + "&domain=" + vworldDomain
          + "&attrFilter=mntn_nm:like:" + encodedName
          + "&format=json&crs=EPSG:4326&size=1000"; // EPSG:4326 = 프론트(카카오맵)에서 쓰는 위경도 좌표계

      byte[] responseBytes = restTemplate.getForObject(new URI(urlString), byte[].class);
      log.info("호출 URL : {}", urlString);
      if (responseBytes == null)
        return null;
      return new String(responseBytes, StandardCharsets.UTF_8);
    } catch (Exception e) {
      log.error("Vworld Trail API 에러: ", e);
      return null;
    }
  }

}
