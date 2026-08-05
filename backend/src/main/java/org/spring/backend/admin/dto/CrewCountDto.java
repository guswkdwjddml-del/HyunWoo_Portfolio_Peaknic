package org.spring.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewCountDto {

  private Long total; // 전체모임수
  private Long recruiting; // 모집중
  private Long closed; // 마감
  private Long completed; // 완료
  private Long cancelled; // 취소
  private Long todayCompleted;  // 오늘완료된 모임수
  
}
