package org.spring.backend.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String askGemini(String userPrompt) {
        try {
            // 🌟 URI 객체로 결합하여 인코딩 변형 방지
            String fullUrlStr = apiUrl + "?key=" + apiKey;
            URI uri = URI.create(fullUrlStr);

            String systemInstruction = "당신은 산악 전문 AI 가이드 '픽봇'입니다. "
                    + "친절하고 정중하게 등산, 산지 날씨, 등산 용품, 안전 수칙 등에 대해 답변해 주세요. "
                    + "답변은 300자 이내로 핵심만 보기 쉽게 작성해 주세요.";

            Map<String, Object> textPart = Map.of("text", systemInstruction + "\n\n사용자 질문: " + userPrompt);
            Map<String, Object> contentsPart = Map.of("parts", List.of(textPart));
            Map<String, Object> requestBody = Map.of("contents", List.of(contentsPart));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 🌟 String.class 및 URI 전달
            ResponseEntity<String> response = restTemplate.postForEntity(uri, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode textNode = root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");

                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            return "🤖 AI 답변을 가져오는 중에 문제가 발생했습니다.";
        } catch (Exception e) {
            e.printStackTrace();
            // 디버깅용 메시지 (이슈 해결 후 원상복구)
            return "🤖 AI 오류 발생: " + e.getMessage();
        }
    }
}