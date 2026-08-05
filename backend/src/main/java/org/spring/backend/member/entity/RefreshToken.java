package org.spring.backend.member.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "refreshToken") // 레디스의 Hash 구조로 저장됨을 명시
public class RefreshToken {
    

    @Id
    private String userEmail; // 사용자의 고유 식별자인 이메일을 Key(Id)로 사용

    private String refreshToken; // 실제 발급된 Refresh 토큰 값

    @TimeToLive
    private Long expiration; // ⭐ 핵심: 만료 시간 (초 단위). 이 시간이 지나면 레디스가 자동으로 데이터를 지워줍니다!
}