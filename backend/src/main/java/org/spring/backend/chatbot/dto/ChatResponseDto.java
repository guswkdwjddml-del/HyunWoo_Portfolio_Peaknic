package org.spring.backend.chatbot.dto;

import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponseDto {
    private String botMessage; // 기본 안내 텍스트
    private String messageType; // "TEXT" 또는 "MOUNTAIN_CARD"
    private MountainDetailDto mountainData; // 카드용 상세 데이터
    private List<ScheduleCardDto> scheduleData;
    private String timestamp;
}