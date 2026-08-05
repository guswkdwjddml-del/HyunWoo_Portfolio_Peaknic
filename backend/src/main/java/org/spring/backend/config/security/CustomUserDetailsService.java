package org.spring.backend.config.security; // 적절한 서비스 패키지에 넣어주세요.

import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    // 생성자 주입
    public CustomUserDetailsService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // 시큐리티가 로그인 시 입력받은 'username(이메일)'을 들고 이 메서드를 찾아옵니다.
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        
        // 1. DB에서 이메일로 유저를 찾음
        MemberEntity member = memberRepository.findByUserEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("해당 이메일을 가진 회원이 존재하지 않습니다: " + username));

        // 2. 찾은 유저 엔티티를 위에서 만든 CustomUserDetails로 포장해서 반환!
        return new CustomUserDetails(member);
    }
}