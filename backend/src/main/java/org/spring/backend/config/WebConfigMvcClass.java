package org.spring.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration  // 스프링 설정 클래스 지정
public class WebConfigMvcClass implements WebMvcConfigurer {

    // application.yaml에 설정한 주소 주입 (환경변수 대응 가능)
    @Value("${app.upload.base-path}")
    private String uploadBasePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 끝에 슬래시(/)가 누락되어 경로가 깨지는 현상을 방지하기 위해 안전장치 추가
        String locationPath = uploadBasePath.endsWith("/") ? uploadBasePath : uploadBasePath + "/";

        // /upload/member/filename.jpg 요청 발생 시 
        // 실제 저장소(예: file:///E:/full/upload/member/filename.jpg) 내부를 매핑하여 탐색합니다.
        registry.addResourceHandler("/upload/**")
                .addResourceLocations(locationPath);
    }
}