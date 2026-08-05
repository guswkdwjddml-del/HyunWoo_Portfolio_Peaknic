package org.spring.backend.weather.scheduler;

import java.util.List;

import org.spring.backend.weather.entity.WeatherEntity;
import org.spring.backend.weather.repository.WeatherRepository;
import org.spring.backend.weather.service.WeatherService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.scheduler.weather-sync", havingValue = "true")
public class WeatherScheduler {

  private final WeatherRepository weatherRepository;
    private final WeatherService weatherService;

    // 처음20초 이후, 5분(300,000 밀리초) 간격으로 무한 반복 실행
    // @Scheduled(initialDelay = 20000, fixedDelay = 300000)
    @Scheduled(initialDelay = 20000, fixedDelay = 300000)
    public void syncWeatherPeriodically() {
        // DB에 한 번이라도 날씨가 검색되어 저장된 산 목록을 모두 불러옵니다.
        List<WeatherEntity> weatherList = weatherRepository.findAll();
        
        if (weatherList.isEmpty()) {
            return; // 업데이트할 데이터가 없으면 패스
        }

        log.info("🌤️ [날씨 스케줄러] 총 {}개의 산 날씨 데이터 동기화를 시작합니다...", weatherList.size());

        for (WeatherEntity weather : weatherList) {
            // 좌표 정보가 정상적으로 들어있는 데이터만 업데이트 수행
            if (weather.getLat() != null && weather.getLon() != null) {
                try {
                    // Service의 weatherUpdate를 호출하여 API에서 새 정보를 가져와 DB를 덮어씌움
                    weatherService.weatherUpdate(
                            weather.getMountain().getMountainName(),
                            weather.getLat(),
                            weather.getLon()
                    );
                    
                    // OpenWeather 무료 티어의 초당/분당 호출 제한(Rate Limit)을 
                    // 방지하기 위해 1번 호출할 때마다 1초씩 쉰다.
                    Thread.sleep(1000); 
                    
                } catch (InterruptedException e) {
                    log.error("날씨 동기화 중 인터럽트 발생", e);
                } catch (Exception e) {
                    log.warn("⚠️ {} 날씨 동기화 실패: {}", weather.getMountain().getMountainName(), e.getMessage());
                }
            }
        }
        
        log.info("🌤️ [날씨 스케줄러] 날씨 데이터 동기화 완료!");
    }

}
