package org.spring.backend.common.util;

import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityMemberUtil { // yein 작성

  private final MemberRepository memberRepository;

  // 로그인 회원 정보 가져오기
  public MemberEntity getLoginMember() {
    // 현재 로그인한 회원 정보 (이메일) 불러오기
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String userEmail = (String) authentication.getPrincipal();

    return memberRepository.findByUserEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));
  }

}
