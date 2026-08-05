package org.spring.backend.weather.repository;

import java.util.Optional;

import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.weather.entity.WeatherEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeatherRepository extends JpaRepository<WeatherEntity, Long> {
    // 특정 산에 연결된 날씨 정보를 찾는 쿼리 메서드
    Optional<WeatherEntity> findByMountain(MountainEntity mountain);
}
