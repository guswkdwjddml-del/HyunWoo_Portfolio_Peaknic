package org.spring.backend.config.security.oauth2;

import java.util.Map;

public class GoogleUserInfo implements OAuth2UserInfo {
    private final Map<String, Object> attributes;

    public GoogleUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override public String getProvider() { return "google"; }
    @Override public String getProviderId() { return (String) attributes.get("sub"); }
    @Override public String getEmail() { return (String) attributes.get("email"); }
    @Override public String getName() { return (String) attributes.get("name"); }
    @Override public String getPhone() { return ""; } // 구글은 일반적으로 권한 범위 제한으로 미제공
    @Override public String getGender() { return ""; }
}