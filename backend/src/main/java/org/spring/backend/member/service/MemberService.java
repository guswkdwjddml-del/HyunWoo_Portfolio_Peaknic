package org.spring.backend.member.service;

import java.io.IOException;
import java.util.Map;

import org.spring.backend.config.security.oauth2.TempSocialUserDto;
import org.spring.backend.member.dto.LoginDto;
import org.spring.backend.member.dto.MemberDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface MemberService {
    
    LoginDto login(LoginDto loginDto);

    LoginDto refresh(LoginDto loginDto);
    
    boolean isEmailAvailable(String userEmail);

    void logout(String userEmail);

    void signup(MemberDto memberDto) throws IOException;

    //============ 관리자페이지 회원관리용(추가_sun) ==============//
    Page<MemberDto> memberList(Pageable pageable, String subject, String search);
    void memberUpdate(Long id, MemberDto memberDto);
    void memberDelete(Long id);
    //========================================================//


    // 현재 로그인한 유저의 전체 정보 조회
    MemberDto detail(String userEmail);
    
    // 회원 정보 수정
    void update(String userEmail, MemberDto memberDto);

    boolean checkPassword(String userEmail, String rawPassword);

    void updatePassword(String userEmail, String password);

    void delete(String userEmail);

    MemberDto getProfile(String userEmail);

    Map<String, Object> updateProfileData(String email, MemberDto memberDto);



    TempSocialUserDto getTempSocialInfo(String ticket);

    ResponseEntity<?> registerOAuth2Member(MemberDto dto, MultipartFile profileFile);

}
