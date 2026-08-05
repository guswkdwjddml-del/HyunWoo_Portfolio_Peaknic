package org.spring.backend.chatbot.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestDto {
    private String userEmail;
    private String message;
    private String mode; // ('GEMINI', 'MOUNTAIN', 'PAYMENT')
}