package org.spring.backend.config.security; 

import org.spring.backend.member.entity.MemberEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final MemberEntity memberEntity;

    // 생성자를 통해 우리 MemberEntity를 주입받습니다.
    public CustomUserDetails(MemberEntity memberEntity) {
        this.memberEntity = memberEntity;
    }

    // 나중에 컨트롤러 등에서 로그인한 회원 정보가 통째로 필요할 때 꺼내 쓰기 위한 Getter
    public MemberEntity getMemberEntity() {
        return memberEntity;
    }

    // ⭐ 중요: 사용자의 권한을 시큐리티 형식으로 반환합니다.
    // 사용자가 정의한 JUNIOR, MEMBER, ADMIN 앞에 "ROLE_"을 붙여서 시큐리티가 인식할 수 있게 만듭니다.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = "ROLE_" + memberEntity.getRole().name(); // 예: ROLE_MEMBER
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return memberEntity.getUserPw(); // 암호화된 비밀번호 반환
    }

    @Override
    public String getUsername() {
        return memberEntity.getUserEmail(); // 우리는 이메일을 고유 식별자(ID)로 사용합니다.
    }
    

    // 아래 계정 상태 설정들은 일단 모두 true(만료 안 됨, 잠기지 않음)로 설정합니다.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}