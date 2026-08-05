package org.spring.backend.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.spring.backend.config.security.oauth2.TempSocialUserDto;
import org.spring.backend.member.dto.LoginDto; // 변경된 DTO 임포트
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.dto.PasswordCheckDto;
import org.spring.backend.member.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    
    private final MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<LoginDto> login(@RequestBody LoginDto loginDto) {
        // 인증용 DTO이므로 별도의 회원가입 벨리데이션 없이 가볍게 진입합니다.
        LoginDto response = memberService.login(loginDto);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/refresh")
    public ResponseEntity<LoginDto> refresh(@RequestBody LoginDto loginDto) {
        // 프론트엔드가 보낸 refreshToken을 검증하여 새 토큰 세트를 반환합니다.
        LoginDto response = memberService.refresh(loginDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal String userEmail) {
        // userDetails.getUsername()을 호출하면 우리가 설정한 유저의 이메일이 나옵니다.
        memberService.logout(userEmail);
        
        return ResponseEntity.ok("로그아웃이 성공적으로 처리되었습니다.");
    }


    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> signup(@Valid @ModelAttribute MemberDto memberDto) {
        try {
            log.info("회원가입 요청 접수 - 이메일: {}, 기본이미지명: {}, 업로드파일 존재여부: {}", 
                    memberDto.getUserEmail(), 
                    memberDto.getDefaultImageName(),
                    (memberDto.getProfileFile() != null && !memberDto.getProfileFile().isEmpty()));

            memberService.signup(memberDto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body("회원가입이 완료되었습니다.");
        } catch (Exception e) {
            log.error("회원가입 처리 중 치명적 오류 발생: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "서버 측 오류로 인해 가입에 실패했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/checkEmail")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestBody EmailCheckRequest request) {
        
        // 서비스 로직 호출 (사용 가능하면 true, 중복이면 false)
        boolean isAvailable = memberService.isEmailAvailable(request.getUserEmail());
        
        // 리액트가 원하는 { isAvailable: true/false } 구조로 응답 생성
        Map<String, Boolean> response = Map.of("isAvailable", isAvailable);
        
        return ResponseEntity.ok(response);
    }

    // --- 컨트롤러 하단 또는 별도 파일에 DTO 선码 ---
    @lombok.Getter
    @lombok.NoArgsConstructor
    public static class EmailCheckRequest {
        private String userEmail;
    }


/**
     * 마이페이지 진입 시 로그인 유저 전체 정보 조회
     */
    @GetMapping("/detail")
    public ResponseEntity<MemberDto> getMyProfile(Principal principal) {
        // principal.getName()은 대개 로그인 ID(여기서는 userEmail)를 반환합니다.
        String userEmail = principal.getName(); 
        MemberDto profile = memberService.detail(userEmail);
        return ResponseEntity.ok(profile);
    }

    /**
     * 개인회원 정보 수정 실행
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateMyProfile(Principal principal, @Valid @RequestBody MemberDto memberDto) {
        String userEmail = principal.getName();
        memberService.update(userEmail, memberDto);
        return ResponseEntity.ok(Map.of("message", "회원 정보가 성공적으로 수정되었습니다."));
    }

    /**
     * 현재 로그인한 사용자의 기존 프로필 상세 조회
     */
    @GetMapping("/profile")
    public ResponseEntity<MemberDto> getCurrentProfile(Principal principal) {
        MemberDto profile = memberService.getProfile(principal.getName());
        return ResponseEntity.ok(profile);
    }

     /* 프로필 이미지 수정 실행 */
     @PutMapping(value = "/updateProfile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
     public ResponseEntity<?> updateOnlyMyProfile(Principal principal, @ModelAttribute MemberDto memberDto) {
         String userEmail = principal.getName();
         try {
             log.info("프로필 전용 변경 요청 - 유저: {}, 프로필 타입: {}", userEmail, memberDto.getProfileType());
             
             // 서비스 레이어에서 정보를 수정한 뒤, 갱신된 토큰 정보를 담은 Map 혹은 DTO를 리턴받습니다.
             // (구현할 서비스 로직에서 새 토큰 정보와 새 이미지 경로를 Map으로 구성하여 반환하게 설계할 예정입니다)
             Map<String, Object> responseData = memberService.updateProfileData(userEmail, memberDto);
             
             return ResponseEntity.ok(responseData);
         } catch (Exception e) {
             log.error("프로필 전용 변경 처리 중 에러 발생: ", e);
             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                     .body(Map.of("message", "수정 실패: " + e.getMessage()));
         }
     }


    @PostMapping("/check-password")
    public ResponseEntity<?> checkPassword(Principal principal, @Valid @RequestBody PasswordCheckDto request) {
        String userEmail = principal.getName(); // 토큰 내 인증된 유저 이메일 추출
        
        boolean isMatched = memberService.checkPassword(userEmail, request.getPassword());
        
        if (!isMatched) {
            // 비밀번호가 불일치할 경우 400 에러와 함께 메시지 반환
            return ResponseEntity.badRequest().body(Map.of("message", "비밀번호가 일치하지 않습니다."));
        }
        
        // 일치할 경우 성공 응답 반환
        return ResponseEntity.ok(Map.of("message", "본인 확인이 완료되었습니다.", "success", true));
    }


    @PutMapping("/updatepw")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal String userEmail, // 🌟 JwtFilter에서 넣어둔 인증 이메일을 안전하게 꺼내옴
            @Valid @RequestBody PasswordCheckDto passwordCheckDto) {
        
        // 서비스 레이어로 이메일과 새 비밀번호 전달
        memberService.updatePassword(userEmail, passwordCheckDto.getPassword());
        
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }


    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(Principal principal) {
        // JwtFilter가 채워놓은 로그인 유저의 이메일을 추출하여 서비스단으로 전달
        if (principal == null || "anonymousUser".equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요한 기능입니다."));
        }
    
        memberService.delete(principal.getName());
        
        return ResponseEntity.ok("회원 탈퇴 및 데이터 삭제가 정상 처리되었습니다.");
    }


    // 1. 프론트가 마운트될 때 안전하게 소셜 데이터 가져가는 API
    @GetMapping("/oauth2/temp-info")
    public ResponseEntity<?> getTempSocialInfo(@RequestParam("ticket") String ticket) {
        try {
            TempSocialUserDto tempInfo = memberService.getTempSocialInfo(ticket);
            return ResponseEntity.ok(tempInfo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.GONE).body(e.getMessage());
        }
    }

    // 2. 최종 소셜 가입 및 자동 로그인 처리 API
    @PostMapping("/oauth2/signup")
    public ResponseEntity<?> oauth2Signup(
            @ModelAttribute MemberDto memberDto, // @ModelAttribute로 폼 데이터와 DTO 매핑 자동화
            @RequestParam(value = "profileFile", required = false) MultipartFile profileFile) {
        try {
            return memberService.registerOAuth2Member(memberDto, profileFile);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("소셜 가입 후 자동 로그인 중 치명적 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("소셜 가입 처리 중 오류가 발생했습니다.");
        }
    }


    @GetMapping("/findId")
    public ResponseEntity<?> getMemberId(@AuthenticationPrincipal String userEmail) {
        // 1. 토큰이 없거나 유효하지 않은 경우
        if (userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증 정보가 유효하지 않습니다.");
        }

        // 2. 서비스에서 회원 정보 조회
        MemberDto dto = memberService.detail(userEmail);

        // 3. 만약 회원이 존재하지 않을 경우 500 방지 (404 반환)
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("해당 이메일의 회원 정보를 찾을 수 없습니다.");
        }

        // 4. memberId 반환 (dto.getId() 또는 dto.getMemberId() 확인!)
        // 프론트엔드의 response.data.memberId 와 매핑됩니다.
        return ResponseEntity.ok(Map.of("memberId", dto.getId()));
    }

}