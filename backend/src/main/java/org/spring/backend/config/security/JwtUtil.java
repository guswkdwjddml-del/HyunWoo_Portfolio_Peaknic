package org.spring.backend.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; // 빌트인 어노테이션 추가
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey SECRET_KEY;

    // 생성자를 통해 application.yml의 jwt.secret 값을 주입받습니다.
    public JwtUtil(@Value("${jwt.secret}") String secretString) {


         System.out.println("JWT SECRET = " + secretString);
        // 주입받은 문자열을 바탕으로 SecretKey 객체를 안전하게 생성합니다.
        this.SECRET_KEY = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    // 토큰 생성을 위한 공통 메서드
    public String createToken(String userEmail, String role, String profileImg, long expirationMillis) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(userEmail)
                .claim("role", role)
                .claim("profileImg", profileImg)
                .issuedAt(now)
                .expiration(validity)
                .signWith(SECRET_KEY)
                .compact();
    }

    // 토큰 내부의 Payload(Claims)를 뜯어보는 메서드
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // 토큰이 만료되었는지 확인하는 메서드
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            return true;
        }
    }
}