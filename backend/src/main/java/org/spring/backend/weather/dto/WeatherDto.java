package org.spring.backend.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDto {
    private Long id;
    private String name;        // 산 이름
    private String country;
    private String temp_max;
    private String temp_min;
    private String icon;
    private String sunset;      // 해 지는시간
    private String sunrise;     // 해 뜨는시간
    private Double lat;          // 위도 
    private Double lon;          // 경도 
    private String temperature;  // 현재 온도 
    private Integer humidity;    // 습도
    private String description;  // 날씨 설명
    private String source;       // 데이터 출처 (DB 캐시인지 API 갱신인지 확인용 추가)
}
