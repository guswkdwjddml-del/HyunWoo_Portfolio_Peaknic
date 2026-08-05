package org.spring.backend.config.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.spring.backend.config.security.JwtUtil; 
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.entity.RefreshToken; 
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.member.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final MemberRepository memberRepository;
    private final OAuth2TempStore oAuth2TempStore;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${cors.allowed-origin}")
    private String FRONT_URL;

    private final long ACCESS_TOKEN_EXPIRATION = 30 * 60 * 1000L;
    private final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000L;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String rawEmail = (String) attributes.get("email");
        String provider = (String) attributes.get("provider");
        String name = (String) attributes.get("name");
        String phone = (String) attributes.get("phone");
        String gender = (String) attributes.get("gender");

        // 🌟 [수정 핵심] 일반 계정이든 다른 소셜이든, 데이터베이스에 이미 이메일이 존재한다면 
        // 에러를 던지지 않고 무조건 즉시 자동 연동 및 로그인 처리(Token 발행)를 수행합니다.
        Optional<MemberEntity> existingMemberOpt = memberRepository.findByUserEmail(rawEmail);

        if (existingMemberOpt.isPresent()) {
            MemberEntity member = existingMemberOpt.get();
            
            // 🌟 지연 로딩(LazyInitializationException)으로 인해 핸들러가 터지는 현상 안전 방어
            String profileImg = "";
            try {
                if (member.getMemberFileEntity() != null) {
                    profileImg = member.getMemberFileEntity().getNewFileName();
                }
            } catch (Exception e) {
                profileImg = ""; // 예외 발생 시 빈 값으로 처리하여 토큰 발행이 끊기지 않도록 방어
            }
    
            String accessToken = jwtUtil.createToken(member.getUserEmail(), member.getRole().name(), profileImg, ACCESS_TOKEN_EXPIRATION);
            String refreshToken = jwtUtil.createToken(member.getUserEmail(), member.getRole().name(), profileImg, REFRESH_TOKEN_EXPIRATION);
    
            refreshTokenRepository.save(RefreshToken.builder()
                    .userEmail(member.getUserEmail())
                    .refreshToken(refreshToken)
                    .expiration(REFRESH_TOKEN_EXPIRATION / 1000)
                    .build());
    
            // 프론트엔드의 로그인 리다이렉트 성공 컴포넌트로 토큰을 실어 보냅니다.
            String targetUrl = UriComponentsBuilder.fromUriString(FRONT_URL+"/auth/oauth2/redirect")
                    .queryParam("accessToken", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("userName", member.getUserName())
                    .queryParam("role", member.getRole().name())
                    .queryParam("userEmail", member.getUserEmail()) 
                    .queryParam("accessTokenExpirationTime", ACCESS_TOKEN_EXPIRATION)
                    .encode().build().toUriString();
            
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return; 
        } else {
            // Case C: 신규 소셜 회원 유입 -> 기존과 동일하게 임시 데이터 적재 후 추가 정보 페이지로 이동시킴
            String ticket = UUID.randomUUID().toString();
            
            TempSocialUserDto tempUser = TempSocialUserDto.builder()
                    .userEmail(rawEmail) 
                    .userName(name)
                    .phone(phone == null ? "" : phone)
                    .gender(gender == null ? "" : gender)
                    .provider(provider)
                    .build();
        
            oAuth2TempStore.put(ticket, tempUser);
        
            String targetUrl = UriComponentsBuilder.fromUriString(FRONT_URL+"/auth/oauth2/join")
                    .queryParam("ticket", ticket)
                    .encode().build().toUriString();
            
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
}