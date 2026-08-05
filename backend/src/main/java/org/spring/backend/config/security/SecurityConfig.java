package org.spring.backend.config.security;

import lombok.RequiredArgsConstructor;
import org.spring.backend.config.security.oauth2.OAuth2AuthenticationSuccessHandler;
import org.spring.backend.member.service.Auth2Service;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final Auth2Service auth2Service;
    private final OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler; // 소문자 카멜케이스 변수명 정제
    
    // 🌟 [수정] final 키워드가 누락되면 @RequiredArgsConstructor에 의해 의존성 주입이 되지 않습니다.
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS 설정 적용 (React 연동)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. CSRF 보안 비활성화
            .csrf(csrf -> csrf.disable())
            
            // 3. 세션 사용 안 함 설정 (STATELESS)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. URL별 권한 설정
            .authorizeHttpRequests(auth -> auth
                
                // 로그인 상태여야만 접근 가능한 경로 지정
                .requestMatchers(
                        // 회원정보 관련
                        "/api/member/logout", "/api/member/logout/**", 
                        "/api/member/detail", "/api/member/detail/**",
                        "/api/member/update","/api/member/update/**",
                        "/api/member/updateProfile","/api/member/updateProfile/**",
                        "/api/member/check-password","/api/member/check-password/**",
                        "/api/member/updatepw","/api/member/updatepw/**",
                        "/api/member/delete","/api/member/delete/**",
                        "/api/member/findId","/api/member/findId/**",

                        // 게시물 관련
                        "/api/board/save","/api/board/save/**",
                        "/api/review/write","/api/review/write/**",
                        "/api/review/update","/api/review/update/**",

                        // 결제 관련
                         "/payment/**",

                         // 알림 관련
                        "/api/notification/**",
                        "/api/crews"
                ).authenticated()

                // 댓글관련
                .requestMatchers(HttpMethod.GET, "/api/board/*/comments", "/api/board/*/comments/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/board/*/comments", "/api/board/*/comments/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/comments/{id}", "/api/comments/{id}/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/comments/{id}", "/api/comments/{id}/**").authenticated()

                
                // 관리자 권한 관련
                .requestMatchers("/admin","/admin/**").hasRole("ADMIN")
                
                // 그 외 모든 요청은 인증 없이 허용
                .anyRequest().permitAll()
            )

            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                        String exceptionAttr = (String) request.getAttribute("exception");
                        response.setContentType("application/json;charset=UTF-8");
                        
                        if ("EXPIRED_TOKEN".equals(exceptionAttr)) {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"code\":\"EXPIRED_TOKEN\",\"message\":\"토큰이 만료되었습니다.\"}");
                        } else if ("INVALID_TOKEN".equals(exceptionAttr)) {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"code\":\"INVALID_TOKEN\",\"message\":\"유효하지 않은 토큰입니다.\"}");
                        } else {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("{\"code\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\"}");
                        }
                    })
            )

            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(auth2Service))
                .successHandler(oauth2AuthenticationSuccessHandler)
            )
            
            // 5. JWT 필터 배치
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 🌟 setAllowedOrigins 대신 setAllowedOriginPatterns 사용
        // 로컬 개발 환경과 배포 환경(EC2 IP)을 모두 등록합니다.
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://54.116.208.12",
            "http://54.116.208.12:80",
            allowedOrigin != null ? allowedOrigin : "*"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        // 리액트가 응답 헤더에 접근할 수 있도록 허용
        configuration.setExposedHeaders(List.of("Authorization", "Authorization-New"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}