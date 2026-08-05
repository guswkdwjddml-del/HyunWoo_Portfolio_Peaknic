package org.spring.backend.crew.entity;

import org.spring.backend.common.BasicTime;

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

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "crew_schedule_tb")
public class CrewScheduleEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crew_schedule_id")
    private Long id;

    @Column(name = "schedule_time", length = 50)
    private String scheduleTime; // 예: "06:00"

    @Column(nullable = false)
    private String title;        // 예: "집결 및 인원 파악"

    @Column(columnDefinition = "TEXT")
    private String description;  // 예: "북한산성 입구 주차장"

    @Column(name = "sort_order")
    private Integer sortOrder;   // 출력 정렬 순서 (1, 2, 3...)

    // N:1 (Crew)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id")
    private CrewEntity crewEntity;
}