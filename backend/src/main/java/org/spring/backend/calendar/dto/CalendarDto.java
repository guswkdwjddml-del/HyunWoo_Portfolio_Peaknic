package org.spring.backend.calendar.dto;

import java.time.LocalDateTime;

import org.spring.backend.common.CalendarStatus;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.RepeatType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDto {

  private Long id;

  // 일정
  private String title;                       // 일정 제목
  private String description;                 // 일정 설명
  private LocalDateTime startDate;            // 일정 시작
  private LocalDateTime endDate;              // 일정 종료
  private String color;                       // 일정 라벨색상(파란계열)
  private Boolean allDay;                     // 일정 (하루종일)
  private String location;                    // 집합 장소
  private Integer reminderMinute;             // 알림시간 설정 (모집마감 몇분전, 일정모임 몇시간전 등등)
  private RepeatType repeatType;                  // 반복일정 (매일,주마다,월마다,1년마다 등등)
  private String calendarRole;              // 예: "ADMIN" (전체 공지), "USER" (개인 일정), "CREW" (소모임)
  private CalendarStatus calendarStatus;              // 일정 상태 (예정,모집중,진행중,완료,취소)

  // 작성자
  private Long memberId;
  private String memberName;

  // 크루
  private Long crewId;
  private String crewName;                    // 크루 이름
  private String crewDetail;                  // 크루 정보
  private Integer crewPrice;                  // 크루 참가비
  private Integer currentPeople;              // 현재 인원
  private Integer crewPeople;                 // 모집 인원
  private CrewStatus crewStatus;              // 크루 상태 (취소,완료,진행중,모집중,,등등)
  private String crewLevel;                   // 산 난이도
  private Integer minAge;                     // 최소연령
  private Integer maxAge;                     // 최고연령
  private LocalDateTime crewDeadline;         // 마감 시간
  private String meetingPlace;                // 집합 장소 (썸네일?개념)
  private String chatLink;                    // 크루(방) 상세정보
  private Integer viewCount;                  // 조회수

  // 산
  private Long mountainId;
  private String mountainName;                // 크루 모임 산
  private String mountainImageUrl;            // 산 이미지

  // 코스
  private Long customCourseId;                
  private String customCourseName;            // 코스 이름
  private Double totalDistance;               // 코스 총거리
  private Integer totalTime;                  // 코스 총시간
  private Integer maxAltitude;                // 코스 최고고도

  // 표시
  private Boolean joined;                     // 내가 참가중인지
  private Boolean host;                       // 내가 방장인지
  private Boolean bookmarked;                 // 즐겨찾기 여부

  // 생성일
  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
