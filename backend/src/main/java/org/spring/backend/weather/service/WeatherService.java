package org.spring.backend.weather.service;


import org.spring.backend.weather.dto.WeatherDto;

public interface WeatherService {

// 산 이름과 위/경도를 받아 날씨 정보를 조회 및 갱신한 후 DTO 형태로 반환합니다.
    public WeatherDto weatherUpdate(String mountainName, Double lat, Double lon);

    WeatherDto weatherByMountain(String mountainName, Double lat, Double lon);

}
