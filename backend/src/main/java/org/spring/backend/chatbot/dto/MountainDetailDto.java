package org.spring.backend.chatbot.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MountainDetailDto {
    private String mountainName;
    private String location;
    private Integer height;
    private String description;
    
    // 날씨 정보
    private String weatherDesc;
    private String temperature;
    private Integer humidity;
    private String weatherSource;
}