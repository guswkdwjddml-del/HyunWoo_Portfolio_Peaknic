package org.spring.backend.member.dto;

import java.time.LocalDateTime;

import org.spring.backend.common.Role;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter

public class LoginDto {

    // 로그인, JWT 검증 시 사용될 DTO

    private String accessToken;
    
    private String refreshToken;

    private String userEmail;

    private String userPw;

    private String userName;

    private Role role;

    private Long accessTokenExpirationTime;

    
}
