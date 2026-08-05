package org.spring.backend.customcourse.entity;

import java.util.ArrayList;
import java.util.List;

import org.spring.backend.common.BasicTime;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.trail.entity.TrailEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// =================== 내가 만든 경로 entity  (아이템,내기록,주간 총 기록 등등) ==================== //
@Entity
@Table(name = "custom_course_tb")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomCourseEntity extends BasicTime {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "custom_course_id")
  private Long id;

  private String mountainName; // 산이름
  private String courseName; // 코스 이름
  private Double totalDistance; // 총 거리
  private Integer totalTime; // 총 시간
  private Integer maxAltitude; // 최고 고도

  // 마커 표시용 출발/도착 위경도
  private Double startLat; // 출발 위도
  private Double startLon; // 출발 경도
  private Double endLat; // 도착 위도
  private Double endLon; // 도착 경도

  // 사용자가 선택한 전체 경로 (카카오맵에 붉은 선을 다시 그리기 위한 용도)
  @Lob
  @Column(columnDefinition = "LONGTEXT")
  private String selectedPath;

  @Lob
  private String selectedSegments; // 지도에 붉은선을 분절이 아니라 온전히 담기

  // -------------------- 연관 관계 --------------------  //
  // 회원과의 연관관계 (N:1) - String 대신 MemberEntity 직접 연결
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id")
  private MemberEntity memberEntity;

  // 어떤 등산로(Trail)를 기반으로 생성된 커스텀 코스인지
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trail_id")
  private TrailEntity trailEntity;

  // 1: N
  @Builder.Default
  @OneToMany(mappedBy = "customCourseEntity", fetch = FetchType.LAZY)
  private List<CrewEntity> crewEntities = new ArrayList<>();

}
