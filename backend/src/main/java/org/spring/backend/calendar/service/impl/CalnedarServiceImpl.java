package org.spring.backend.calendar.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.spring.backend.calendar.dto.CalendarDto;
import org.spring.backend.calendar.entity.CalendarEntity;
import org.spring.backend.calendar.repository.CalendarRepository;
import org.spring.backend.calendar.service.CalendarService;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalnedarServiceImpl implements CalendarService {

  private final CalendarRepository calendarRepository;
  private final CrewRepository crewRepository;

  @Override
  public List<CalendarDto> userCalendar(Long memberId) {
    List<CalendarDto> eventList = new ArrayList<>();

    // 1. 관리자+개인일정 가져오기
    List<CalendarEntity> myCalendars = calendarRepository.findAllByCalendarRoleOrMemberEntityId("ADMIN", memberId);

    for (CalendarEntity entity : myCalendars) {
      eventList.add(CalendarDto.builder()
          .id(entity.getId()) // 캘린더 엔티티는 접두사 cal_
          .title(entity.getTitle())
          .startDate(entity.getStartDate())
          .endDate(entity.getEndDate() != null ? entity.getEndDate() : null)
          .color(entity.getColor())
          .allDay(entity.getAllDay())
          .description(entity.getDescription())
          .calendarRole(entity.getCalendarRole())
          .location(entity.getLocation())
          .build());
    }

    // 2. [내 크루 모임] 가져오기
    List<CrewEntity> myCrews = crewRepository.findByMemberEntityId(memberId);

    for (CrewEntity entity : myCrews) {
      String mountainName = entity.getMountainEntity() != null ? entity.getMountainEntity().getMountainName()
          : "산 정보 없음";

      // 최고 고도 (CustomCourse에 고도가 있다면 그걸 쓰고, 없으면 산 고도 사용)
      Integer maxAltitude = entity.getMountainEntity() != null ? entity.getMountainEntity().getHeight() : 0;
      Double totalDistance = 0.0;
      if (entity.getCustomCourseEntity() != null) {
        totalDistance = entity.getCustomCourseEntity().getTotalDistance(); // Entity에 맞게 메서드명 확인
      }
      // 방장 이름 (Entity의 userName 또는 memberName 확인 필요)
      String memberName = entity.getMemberEntity() != null ? entity.getMemberEntity().getUserName() : "알 수 없음";

      eventList.add(CalendarDto.builder()
          .id(entity.getId())
          .title(entity.getCrewName())
          .startDate(entity.getCrewStartDate())
          .endDate(entity.getCrewEndDate() != null ? entity.getCrewEndDate() : null)
          .color(entity.getColor() != null ? entity.getColor() : "#ff9f43")
          .description(entity.getCrewDetail())
          .allDay(false)
          .calendarRole("CREW")
          .location(entity.getMeetingPlace())
          // 크루 모달 표시용 추가 정보
          .mountainName(mountainName)
          .memberName(memberName)
          .currentPeople(entity.getCurrentPeople())
          .crewPeople(entity.getCrewPeople())
          .crewPrice(entity.getCrewPrice())
          .crewLevel(entity.getCrewLevel())
          .totalDistance(totalDistance)
          .maxAltitude(maxAltitude)
          .crewDeadline(entity.getCrewDeadline())
          .crewStatus(entity.getCrewStatus())
          .build());
    }

    return eventList;
  }
}
