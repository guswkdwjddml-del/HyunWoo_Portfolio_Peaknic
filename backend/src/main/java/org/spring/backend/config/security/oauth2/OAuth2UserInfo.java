package org.spring.backend.config.security.oauth2;

import java.util.Map;

public interface OAuth2UserInfo {
    String getProvider();
    String getProviderId();
    String getEmail();
    String getName();
    String getPhone();
    String getGender();
}