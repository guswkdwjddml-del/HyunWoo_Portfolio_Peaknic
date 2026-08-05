package org.spring.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${spring.rabbitmq.host}")
    private String rabbitHost;


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 웹소켓 연결을 맺을 엔드포인트 지정 (/ws-stomp)
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*") // 프론트엔드 도메인 주소에 맞게 추후 수정 가능
                .withSockJS(); // SockJS 폴백 지원
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. 클라이언트가 메시지를 보낼 때(SEND) 붙일 주소 Prefix
        // 예: 프론트에서 /app/chatbot.message 로 발송
        registry.setApplicationDestinationPrefixes("/app");

        // 2. 외부 대외 브로커(RabbitMQ) 연동 설정
        // ⚠️ RabbitMQ STOMP 플러그인은 규칙상 기본적으로 '/topic'과 '/queue'를 주소로 인식합니다.
        // - /topic: 1:N 전체 방송(Pub/Sub)
        // - /queue: 1:1 메시지 전송(Point-to-Point)
        registry.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(rabbitHost)
                .setRelayPort(61613) // RabbitMQ STOMP 포트
                .setClientLogin("guest")
                .setClientPasscode("guest");
    }
}