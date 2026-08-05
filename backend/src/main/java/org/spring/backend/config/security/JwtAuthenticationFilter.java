package org.spring.backend.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // 토큰 기본 만료 시간 정의 (30분)
    private final long ACCESS_TOKEN_EXPIRATION = 30 * 60 * 1000L;
    // 슬라이딩 세션 발급 기준 시간 (20분 이하로 남았을 때)
    private final long SLIDING_THRESHOLD = 29 * 60 * 1000L;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        Claims claims = null;

        // 1. 헤더에서 토큰 추출 및 검증
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                // 토큰을 파싱하면서 만료 여부 및 위조 여부를 동시에 검증 (1회만 수행)
                claims = jwtUtil.extractClaims(token);

                // 🌟 [추가] 조건부 슬라이딩 세션 실시간 체크 및 자동 재발급 로직
                if (claims != null && claims.getExpiration() != null) {
                    long remainingTime = claims.getExpiration().getTime() - System.currentTimeMillis();

                    // 토큰이 유효한 상태이면서, 남은 시간이 20분(SLIDING_THRESHOLD) 이하일 때만 실행
                    if (remainingTime > 0 && remainingTime <= SLIDING_THRESHOLD) {
                        String userEmail = claims.getSubject();
                        String role = claims.get("role", String.class);
                        String profileImg = claims.get("profileImg", String.class);

                        if (userEmail != null && role != null) {
                            // 기존 권한명 규격을 그대로 유지하여 새 토큰 생성 (30분짜리 신선한 토큰)
                            String newAccessToken = jwtUtil.createToken(userEmail, role, profileImg, ACCESS_TOKEN_EXPIRATION);
                            
                            // 프론트엔드가 감지해서 로컬스토리지를 갈아끼울 수 있도록 커스텀 응답 헤더에 탑재
                            response.setHeader("Authorization-New", "Bearer " + newAccessToken);
                            log.info("🔓 [Sliding Session] 토큰 만료 임박(남은시간: {}분). 새 Access Token을 자동 재발급하여 헤더에 주입했습니다. 유저: {}", 
                                    remainingTime / 1000 / 60, userEmail);
                        }
                    }
                }

            } catch (ExpiredJwtException e) {
                // 💡 중요: 엑세스 토큰이 완전히 만료되었을 때 React가 알아채고 /refresh를 요청할 수 있도록 custom attribute 세팅
                request.setAttribute("exception", "EXPIRED_TOKEN");
            } catch (Exception e) {
                request.setAttribute("exception", "INVALID_TOKEN");
            }
        }

        // 2. 인증 객체 생성 (DB 조회 없이 Claims 정보 활용)
        if (claims != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String userEmail = claims.getSubject();
            String role = claims.get("role", String.class);

            if (userEmail != null && role != null) {
                String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                List<SimpleGrantedAuthority> authorities = 
                        Collections.singletonList(new SimpleGrantedAuthority(roleWithPrefix));
                
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userEmail, null, authorities);
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}