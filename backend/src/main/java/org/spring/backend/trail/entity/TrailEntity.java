package org.spring.backend.trail.entity;

import java.util.ArrayList;
import java.util.List;
import org.spring.backend.customcourse.entity.CustomCourseEntity;
import org.spring.backend.mountain.entity.MountainEntity;

import jakarta.persistence.*;
import lombok.*;

//=============================   등산로 정보   ========================================//
@Entity
@Table(name = "trail_tb")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trail_id")
    private Long id;

    @Column(name = "course_name")
    private String courseName; // 코스명 (없으면 출발지-도착지 가공)

    @Column(name = "difficulty")
    private String difficulty; // 난이도 (cat_nam: 상, 중, 하)

    @Column(name = "course_length")
    private Double courseLength; // 길이 (sec_len - 단위 변환 필요)

    @Column(name = "up_time")
    private Integer upTime; // 상행 시간 (up_min)

    @Column(name = "down_time")
    private Integer downTime; // 하행 시간 (down_min)

    // VWorld 기준 코스 좌표 (화면에 빨간 선으로 그려질 기본 등산로)
    @Lob
    @Column(name = "coordinates", columnDefinition = "LONGTEXT")
    private String coordinates;

    // ======================================== 연관 관계 ========================================//

    // 1:N
    @Builder.Default
    @OneToMany(mappedBy = "trailEntity", fetch = FetchType.LAZY)
    private List<CustomCourseEntity> customCourseEntities = new ArrayList<>();

    // N:1 (Mountain) 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mountain_id")
    private MountainEntity mountain;
}