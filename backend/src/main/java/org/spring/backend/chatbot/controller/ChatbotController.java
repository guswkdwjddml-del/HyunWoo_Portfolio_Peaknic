package org.spring.backend.chatbot.controller;

import lombok.RequiredArgsConstructor;
import org.spring.backend.chatbot.dto.ChatRequestDto;
import org.spring.backend.chatbot.dto.ChatResponseDto;
import org.spring.backend.chatbot.service.ChatbotService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chatbot.message")
    public void handleChatbotMessage(ChatRequestDto requestDto) {
        // 비즈니스 서비스 레이어로 전달하여 응답 추출
        ChatResponseDto responseDto = chatbotService.processBotMessage(requestDto);
        
        // 1:1 대화 큐 채널로 개인 유저에게 푸시 발송
        messagingTemplate.convertAndSend("/queue/chatbot.reply." + requestDto.getUserEmail(), responseDto);
    }
}