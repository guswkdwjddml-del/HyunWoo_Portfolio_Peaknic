package org.spring.backend.chatbot.service;

import org.spring.backend.chatbot.dto.ChatRequestDto;
import org.spring.backend.chatbot.dto.ChatResponseDto;

public interface ChatbotService {
    ChatResponseDto processBotMessage(ChatRequestDto requestDto);
    
}