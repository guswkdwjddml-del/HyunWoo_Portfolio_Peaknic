package org.spring.backend.calendar.repository;

import java.util.List;

import org.spring.backend.calendar.entity.CalendarEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarRepository extends JpaRepository<CalendarEntity,Long>{
  // 관리자공지 + 개인일정  
  List<CalendarEntity> findAllByCalendarRoleOrMemberEntityId(String calendarRole, Long memberId);
}
