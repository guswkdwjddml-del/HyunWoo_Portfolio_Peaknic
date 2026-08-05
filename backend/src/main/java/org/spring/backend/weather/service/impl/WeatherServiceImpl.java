package org.spring.backend.weather.service.impl;

import java.time.LocalDateTime;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.weather.dto.WeatherDto;
import org.spring.backend.weather.entity.WeatherEntity;
import org.spring.backend.weather.repository.WeatherRepository;
import org.spring.backend.weather.service.WeatherService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WeatherServiceImpl implements WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final MountainRepository mountainRepository;
    private final WeatherRepository weatherRepository;

    @Value("${api.weather.url}")
    private String weatherApiUrl;

    @Value("${api.weather.key}")
    private String weatherApiKey;

    // 1. 기존 메서드: 5분 이내 DB 캐시 데이터를 활용하는 날씨 조회
    @Override
    public WeatherDto weatherUpdate(String mountainName, Double lat, Double lon) {
        WeatherDto resultDto = new WeatherDto();
        resultDto.setName(mountainName);
        resultDto.setLat(lat);
        resultDto.setLon(lon);

        // 산 정보를 DB에서 찾는다
        MountainEntity mountain = mountainRepository.findByMountainNameContaining(mountainName).stream().findFirst()
                .orElse(null);

        if (mountain != null) {
            WeatherEntity weather = weatherRepository.findByMountain(mountain).orElse(null);

            // 날씨 정보가 존재하고 5분이 지나지 않았다면 DB 데이터 반환
            if (weather != null && weather.getLastUpdated() != null &&
                    weather.getLastUpdated().isAfter(LocalDateTime.now().minusMinutes(5))) {

                resultDto.setDescription(weather.getWeatherDesc());
                resultDto.setTemperature(weather.getTemperature());
                resultDto.setHumidity(weather.getHumidity());
                resultDto.setSource("DB (최근 5분 이내 데이터)");
                return resultDto;
            }
        }

        // DB 캐시가 없거나 5분이 지났다면 OpenWeather API 호출
        try {
            String url = String.format("%s?lat=%f&lon=%f&appid=%s&units=metric&lang=kr",
                    weatherApiUrl, lat, lon, weatherApiKey);
            JsonNode root = restTemplate.getForObject(url, JsonNode.class);

            String desc = root.path("weather").get(0).path("description").asText();
            String temp = root.path("main").path("temp").asDouble() + "℃";
            int humidity = root.path("main").path("humidity").asInt();

            resultDto.setDescription(desc);
            resultDto.setTemperature(temp);
            resultDto.setHumidity(humidity);
            resultDto.setSource("OpenWeather API 갱신 완료");

            if (mountain != null) {
                WeatherEntity weather = weatherRepository.findByMountain(mountain)
                        .orElse(new WeatherEntity());

                weather.setMountain(mountain);
                weather.setWeatherDesc(desc);
                weather.setTemperature(temp);
                weather.setHumidity(humidity);
                weather.setLastUpdated(LocalDateTime.now());
                weather.setLat(lat);
                weather.setLon(lon);

                weatherRepository.save(weather);
            }
        } catch (Exception e) {
            resultDto.setDescription("날씨 정보 없음");
            resultDto.setTemperature("-");
            resultDto.setHumidity(null);
            resultDto.setSource("API 호출 실패");
        }

        return resultDto;
    }

    // 2. 신규 추가 메서드: 무조건 실시간 API를 호출하여 조회 및 리턴
    @Override
    public WeatherDto weatherByMountain(String mountainName, Double lat, Double lon) {
        WeatherDto resultDto = new WeatherDto();
        resultDto.setName(mountainName);
        resultDto.setLat(lat);
        resultDto.setLon(lon);

        // 산 정보를 DB에서 검색 (API 조회 성공 시 최신 상태 갱신 목적)
        MountainEntity mountain = mountainRepository.findByMountainNameContaining(mountainName).stream().findFirst()
                .orElse(null);

        // DB 검증 없이 무조건 OpenWeather API 직접 호출
        try {
            String url = String.format("%s?lat=%f&lon=%f&appid=%s&units=metric&lang=kr",
                    weatherApiUrl, lat, lon, weatherApiKey);
            JsonNode root = restTemplate.getForObject(url, JsonNode.class);

            String desc = root.path("weather").get(0).path("description").asText();
            String temp = root.path("main").path("temp").asDouble() + "℃";
            int humidity = root.path("main").path("humidity").asInt();

            resultDto.setDescription(desc);
            resultDto.setTemperature(temp);
            resultDto.setHumidity(humidity);
            resultDto.setSource("OpenWeather API 실시간 조회 완료");

            // 실시간 조회한 최신 날씨 데이터를 DB에도 반영
            if (mountain != null) {
                WeatherEntity weather = weatherRepository.findByMountain(mountain)
                        .orElse(new WeatherEntity());

                weather.setMountain(mountain);
                weather.setWeatherDesc(desc);
                weather.setTemperature(temp);
                weather.setHumidity(humidity);
                weather.setLastUpdated(LocalDateTime.now());
                weather.setLat(lat);
                weather.setLon(lon);

                weatherRepository.save(weather);
            }
        } catch (Exception e) {
            resultDto.setDescription("날씨 정보 없음");
            resultDto.setTemperature("-");
            resultDto.setHumidity(null);
            resultDto.setSource("API 호출 실패");
        }

        return resultDto;
    }

}