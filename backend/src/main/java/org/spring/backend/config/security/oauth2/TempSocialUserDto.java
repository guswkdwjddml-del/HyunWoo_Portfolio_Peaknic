package org.spring.backend.config.security.oauth2;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TempSocialUserDto {
    private String userEmail;
    private String userName;
    private String phone;
    private String gender;
    private String provider;
}