package org.spring.backend.trail.entity;

import java.time.LocalDateTime;

import org.spring.backend.hikingrecord.entity.HikingRecordEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//=============================   등산로 좌표저장 (카카오맵 Polyline표시, 사용자GPS)   ========================================//
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "trail_point_tb")
public class TrailPointEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "trail_point_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "hiking_record_id")
  private HikingRecordEntity hikingRecord; // 어느 기록에 속한 점인지

  private Double latitude; // 사용자 위도
  private Double longitude; // 사용자 경도
  private Double altitude; // 사용자 현재 고도 (스마트폰 GPS 지원 시)

  private LocalDateTime recordedAt; // 찍힌 시간

}
