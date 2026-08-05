package org.spring.backend.config.security.oauth2;

import java.util.Map;

public class NaverUserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;

    @SuppressWarnings("unchecked")
    public NaverUserInfo(Map<String, Object> attributes) {
        // 네이버는 'response' 키 내부에 JSON 데이터가 래핑되어 내려옵니다.
        this.attributes = (Map<String, Object>) attributes.get("response");
    }

    @Override public String getProvider() { return "naver"; }
    @Override public String getProviderId() { return (String) attributes.get("id"); }
    @Override public String getEmail() { return (String) attributes.get("email"); }
    @Override public String getName() { return (String) attributes.get("name"); }
    @Override public String getPhone() { return (String) attributes.get("mobile"); }
    @Override 
    public String getGender() { 
        String gender = (String) attributes.get("gender");
        if ("M".equalsIgnoreCase(gender)) return "남성";
        if ("F".equalsIgnoreCase(gender)) return "여성";
        return "";
    }
}