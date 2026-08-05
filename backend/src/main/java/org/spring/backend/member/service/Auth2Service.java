package org.spring.backend.member.service;

import lombok.RequiredArgsConstructor;
import org.spring.backend.config.security.oauth2.GoogleUserInfo;
import org.spring.backend.config.security.oauth2.NaverUserInfo;
import org.spring.backend.config.security.oauth2.OAuth2UserInfo;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Auth2Service extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = null;

        if ("google".equalsIgnoreCase(registrationId)) {
            oAuth2UserInfo = new GoogleUserInfo(oAuth2User.getAttributes());
        } else if ("naver".equalsIgnoreCase(registrationId)) {
            oAuth2UserInfo = new NaverUserInfo(oAuth2User.getAttributes());
        }

        if (oAuth2UserInfo == null) {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인 공급자입니다.");
        }

        // Custom SuccessHandler로 데이터를 전달하기 위해 내부 가공 맵 배치
        Map<String, Object> customAttributes = new HashMap<>();
        customAttributes.put("provider", oAuth2UserInfo.getProvider());
        customAttributes.put("email", oAuth2UserInfo.getEmail());
        customAttributes.put("name", oAuth2UserInfo.getName());
        customAttributes.put("phone", oAuth2UserInfo.getPhone());
        customAttributes.put("gender", oAuth2UserInfo.getGender());

        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                customAttributes,
                "email" // 가공 필드의 핵심 식별 키 지정
        );
    }
}