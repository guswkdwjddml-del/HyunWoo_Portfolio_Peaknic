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
public class MemberCountDto {

  private Long total; // 전체 회원수
  private Long admin; // 관리자
  private Long host; // 구독회원
  private Long junior; // 일반회원
  private Long todayJoin; // 오늘 가입 회원 수

}
