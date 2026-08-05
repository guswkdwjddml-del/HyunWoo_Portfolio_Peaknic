package org.spring.backend.cart.dto;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.crew.dto.CrewFileDto;

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
public class CartItemDto { // yein 작성

  private Long id; // 장바구니 아이템 아이디

  private Long crewId; // 크루 아이디

  private String crewName; // 크루명

  private int crewPrice; // 크루 참가비

  private int crewPeople; // 총 모집 인원

  private int currentPeople; // 현재 참여 중인 인원 (결제 완료시 +1)

  private LocalDateTime crewDeadline; // 크루 모집 마감 날짜

  private LocalDateTime crewStartDate; // 크루 모임 시작 날짜

  private LocalDateTime crewEndDate; // 크루 모임 끝나는 날짜

  private String meetingPlace; // 크루 집합 장소

  private String mountainName; // 산 이름

  private CrewStatus crewStatus; // 크루 상태

  private String mountainImageUrl; // 산 이미지 경로

  private List<CrewFileDto> crewFiles; // 크루 이미지 파일

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
