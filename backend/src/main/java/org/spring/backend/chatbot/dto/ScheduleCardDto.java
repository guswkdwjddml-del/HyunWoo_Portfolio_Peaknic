package org.spring.backend.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCardDto {
    private Long crewId;
    private String crewName;
    private String mountainName;
    private LocalDateTime crewStartDate;
    private String role; // "LEADER" (내가 생성한 크루) 또는 "MEMBER" (참여한 크루)
    private String crewStatus;
    private String location;
}