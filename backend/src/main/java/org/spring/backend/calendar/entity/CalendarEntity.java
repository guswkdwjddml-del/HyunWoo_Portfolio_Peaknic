package org.spring.backend.calendar.entity;

import java.time.LocalDateTime;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.CalendarStatus;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.RepeatType;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.member.entity.MemberEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@Getter
@Table(name = "calendar_tb")
public class CalendarEntity extends BasicTime {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "calendar_id")
  private Long id;

  @Column(nullable = false)
  private String title;                     // 일정 제목

  @Column(columnDefinition = "TEXT")
  private String description;               // 일정 내용

  @Column(nullable = false)
  private LocalDateTime startDate;          // 일정 시작

  private LocalDateTime endDate;            // 일정 종료

  @Builder.Default
  private String color = "#3498db";       // 캘린더에 표시될 라벨 색상

  @Column(nullable = false)
  private String calendarRole;              // 예: "ADMIN" (전체 공지), "USER" (개인 일정), "CREW" (소모임)

  @Builder.Default
  private Boolean allDay = false;           // 일정 - 하루종일

  private String location;                  // 집합 장소 또는 일정 장소

  @Enumerated(EnumType.STRING)
  private CalendarStatus calendarStatus;    // 일정 관리상태 (일정중,모집중,완료,취소 등등,,)

  @Enumerated(EnumType.STRING)
  private CrewStatus crewStatus;            // 크루 (모집중,마감,완료)

  private String crewLevel;                   // 산 난이도

  private Integer reminderMinute;           // 알림시간 설정 (모집마감 몇분전, 일정모임 몇시간전 등등)

  private RepeatType repeatType;            // 반복일정 (매일,주마다,월마다,1년마다 등등)



  // --------------------- 연관 관계 ---------------------------- //
  
  // N:1
  // 관리자가 전체 공지를 쓸 때는 관리자의 memberId가 들어가거나 null로 처리 가능
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id")
  private MemberEntity memberEntity;

  // N:1
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="crew_id")
  private CrewEntity crewEntity;


}
