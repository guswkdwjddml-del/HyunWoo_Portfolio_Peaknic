package org.spring.backend.hikingrecord.entity;

import java.time.LocalDateTime;

import org.spring.backend.common.BasicTime;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.trail.entity.TrailEntity;

import jakarta.persistence.CascadeType;
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

//=============================   등산기록   ========================================//
@Entity
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hiking_record_tb")
public class HikingRecordEntity extends BasicTime{

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "hiking_record_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trail_id")
  private TrailEntity trail; // 어떤 코스를 탔는지

  private Double totalDistance; // 실제 이동 거리 (km)
  private Integer totalTime; // 소요 시간 (분)
  private Double calories; // 소모 칼로리 (kcal)

  private Boolean isCompleted; // 완주 여부

  private LocalDateTime startTime; // 등산 시작 시간
  private LocalDateTime endTime; // 등산 종료 시간

  // 회원과의 연관관계 (N:1)
  @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
  @JoinColumn(name = "member_id")
  private MemberEntity memberEntity;
  
}
