package org.spring.backend.calendar.service;

import java.util.List;

import org.spring.backend.calendar.dto.CalendarDto;

public interface CalendarService {

  
  public List<CalendarDto> userCalendar(Long memberId);

}
