package org.spring.backend.weather.entity;

import java.time.LocalDateTime;

import org.spring.backend.mountain.entity.MountainEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "weather_tb")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weather_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mountain_id")
    private MountainEntity mountain;

    private String weatherDesc; // 맑음, 흐림 등
    private String temperature; // 현재 온도
    private Integer humidity; // 습도
    private LocalDateTime lastUpdated; // 캐시 갱신용 시간

    // 스케쥴러로 업데이트할 기준 좌표
    private Double lat; // 위도
    private Double lon; // 경도

}
