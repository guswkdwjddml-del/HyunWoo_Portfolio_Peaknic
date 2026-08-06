package org.spring.backend.member.service.impl;

import org.spring.backend.member.service.MemberService;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.s3upload.S3UploadService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.spring.backend.common.Role;
import org.spring.backend.config.security.JwtUtil;
import org.spring.backend.config.security.oauth2.OAuth2TempStore;
import org.spring.backend.config.security.oauth2.TempSocialUserDto;
import org.spring.backend.member.dto.LoginDto;
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.entity.MemberFileEntity;
import org.spring.backend.member.entity.RefreshToken;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.member.repository.RefreshTokenRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OAuth2TempStore oAuth2TempStore;
    private final NotificationService notificationService;
    private final S3UploadService s3UploadService;

    // 토큰 만료 시간 (30분 / 7일)
    private final long ACCESS_TOKEN_EXPIRATION = 30 * 60 * 1000L;
    private final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000L;

    @Override
    @Transactional
    public LoginDto login(LoginDto loginDto) {

        // 1. 이메일 존재 여부 확인
        MemberEntity member = memberRepository.findByUserEmail(loginDto.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다."));

        // 2. 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(loginDto.getUserPw(), member.getUserPw())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        String profileImg = "";
        if (member.getMemberFileEntity() != null) {
            profileImg = member.getMemberFileEntity().getNewFileName();
        }

        // 3. Access Token & Refresh Token 쌍 생성
        String accessToken = jwtUtil.createToken(member.getUserEmail(), member.getRole().name(), profileImg,
                ACCESS_TOKEN_EXPIRATION);
        String refreshToken = jwtUtil.createToken(member.getUserEmail(), member.getRole().name(), profileImg,
                REFRESH_TOKEN_EXPIRATION);

        // 4. Redis에 Refresh Token 저장 (기존 토큰 자동 덮어쓰기)
        refreshTokenRepository.save(RefreshToken.builder()
                .userEmail(member.getUserEmail())
                .refreshToken(refreshToken)
                .expiration(REFRESH_TOKEN_EXPIRATION / 1000) // 초 단위 변환
                .build());

        // 5. 로그인 성공 응답 데이터 생성
        return LoginDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userEmail(member.getUserEmail())
                .userName(member.getUserName())
                .role(member.getRole())
                .accessTokenExpirationTime(ACCESS_TOKEN_EXPIRATION)
                .build();
    }

    @Override
    @Transactional
    public LoginDto refresh(LoginDto loginDto) {

        String refreshToken = loginDto.getRefreshToken();

        // 1. 요청에 Refresh Token이 존재하고, 만료되지 않았는지 1차 검증
        if (refreshToken == null || jwtUtil.isTokenExpired(refreshToken)) {
            throw new IllegalArgumentException("Refresh Token이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.");
        }

        // 2. 토큰이 유효하다면 내부 Payload에서 사용자의 이메일(Subject)을 추출
        String userEmail;
        try {
            userEmail = jwtUtil.extractClaims(refreshToken).getSubject();
        } catch (Exception e) {
            throw new IllegalArgumentException("유효하지 않은 토큰 구조입니다.");
        }

        // 3. 추출한 이메일을 Key로 삼아 Redis에 저장된 진짜 토큰을 조회
        RefreshToken redisToken = refreshTokenRepository.findById(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("인증 정보가 만료되었습니다. 다시 로그인해주세요."));

        // 4. 프론트엔드가 보낸 토큰과 Redis에 저장된 토큰이 일치하는지 대조
        if (!redisToken.getRefreshToken().equals(refreshToken)) {
            throw new IllegalArgumentException("토큰 정보가 일치하지 않습니다. 위조된 요청일 수 있습니다.");
        }

        // 5. 최신 회원 정보를 DB에서 조회 후 새로운 Access Token 발행
        MemberEntity member = memberRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String profileImg = "";
        if (member.getMemberFileEntity() != null) {
            profileImg = member.getMemberFileEntity().getNewFileName();
        }

        String newAccessToken = jwtUtil.createToken(member.getUserEmail(), member.getRole().name(), profileImg,
                ACCESS_TOKEN_EXPIRATION);

        // 6. 새로운 Access Token과 기존 Refresh Token 반환
        return LoginDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .userEmail(member.getUserEmail())
                .userName(member.getUserName())
                .role(member.getRole())
                .accessTokenExpirationTime(ACCESS_TOKEN_EXPIRATION)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String userEmail) {
        return !memberRepository.existsByUserEmail(userEmail);
    }

    @Override
    @Transactional
    public void logout(String userEmail) {
        refreshTokenRepository.deleteById(userEmail);
    }

    @Override
    @Transactional
    public void signup(MemberDto memberDto) throws IOException {
        // 1. 이메일 중복 검증
        if (memberRepository.findByUserEmail(memberDto.getUserEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 2. 패스워드 암호화
        String encodedPassword = passwordEncoder.encode(memberDto.getUserPw());

        MemberEntity memberEntity = MemberEntity.builder()
                .userEmail(memberDto.getUserEmail())
                .userPw(encodedPassword)
                .userName(memberDto.getUserName())
                .phone(memberDto.getPhone())
                .address(memberDto.getAddress())
                .memberDetail(memberDto.getMemberDetail())
                .gender(memberDto.getGender())
                .hikingLevel(memberDto.getHikingLevel())
                .messageAgree(memberDto.isMessageAgree())
                .role(Role.JUNIOR)
                .build();

        // 3. 프로필 이미지 분기 처리 (기본 이미지 vs 커스텀 업로드 파일)
        MultipartFile profileFile = memberDto.getProfileFile();

        if (profileFile != null && !profileFile.isEmpty()) {
            // S3에 파일 업로드 후 저장된 전체 URL 반환
            String uploadedUrl = s3UploadService.upload(profileFile, "member");

            memberEntity.setAttachFile(true);

            MemberFileEntity memberFileEntity = MemberFileEntity.builder()
                    .oldFileName(profileFile.getOriginalFilename())
                    .newFileName(uploadedUrl) // S3 URL 저장
                    .memberEntity(memberEntity)
                    .build();

            memberEntity.setMemberFileEntity(memberFileEntity);

        } else if (memberDto.getDefaultImageName() != null && !memberDto.getDefaultImageName().isBlank()) {
            memberEntity.setAttachFile(false);

            MemberFileEntity memberFileEntity = MemberFileEntity.builder()
                    .oldFileName(memberDto.getDefaultImageName())
                    .newFileName("/images/" + memberDto.getDefaultImageName())
                    .memberEntity(memberEntity)
                    .build();

            memberEntity.setMemberFileEntity(memberFileEntity);
        }

        // 4. 최종 영속화
        memberRepository.save(memberEntity);
    }

    // ============ 관리자페이지 회원관리용 ==============//
    @Override
    public Page<MemberDto> memberList(Pageable pageable, String subject, String search) {

        if (subject == null || subject.isBlank() || search == null || search.isBlank()) {
            Page<MemberEntity> memberEntities = memberRepository.findAll(pageable);
            return memberEntities.map(MemberDto::toMemberDto);
        }

        Page<MemberEntity> memberEntities;
        switch (subject) {
            case "userEmail":
                memberEntities = memberRepository.findByUserEmailContaining(search, pageable);
                break;
            case "userName":
                memberEntities = memberRepository.findByUserNameContaining(search, pageable);
                break;
            case "phone":
                memberEntities = memberRepository.findByPhoneContaining(search, pageable);
                break;
            case "role":
                memberEntities = memberRepository.findByRoleContaining(search.toUpperCase(), pageable);
                break;
            default:
                memberEntities = memberRepository.findAll(pageable);
        }

        return memberEntities.map(MemberDto::toMemberDto);
    }

    @Override
    @Transactional
    public void memberUpdate(Long id, MemberDto memberDto) {
        MemberEntity member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        member.setRole(memberDto.getRole());
        member.setHikingLevel(memberDto.getHikingLevel());
    }

    @Override
    @Transactional
    public void memberDelete(Long id) {
        MemberEntity member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (member.getMemberFileEntity() != null) {
            deleteS3CustomFile(member.getMemberFileEntity().getNewFileName());
        }

        memberRepository.deleteById(id);
    }
    // ========================================================//

    @Override
    public MemberDto detail(String userEmail) {
        MemberEntity member = memberRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String oldFileName = null;
        String newFileName = null;
        if (member.getMemberFileEntity() != null) {
            oldFileName = member.getMemberFileEntity().getOldFileName();
            newFileName = member.getMemberFileEntity().getNewFileName();
        }

        return MemberDto.builder()
                .id(member.getId())
                .userEmail(member.getUserEmail())
                .userName(member.getUserName())
                .phone(member.getPhone())
                .address(member.getAddress())
                .memberDetail(member.getMemberDetail())
                .gender(member.getGender())
                .hikingLevel(member.getHikingLevel())
                .role(member.getRole())
                .messageAgree(member.isMessageAgree())
                .createTime(member.getCreateTime())
                .updateTime(member.getUpdateTime())
                .attachFile(member.isAttachFile())
                .oldFileName(oldFileName)
                .newFileName(newFileName)
                .build();
    }

    @Override
    @Transactional
    public void update(String userEmail, MemberDto memberDto) {
        MemberEntity member = memberRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        member.setUserName(memberDto.getUserName());
        member.setPhone(memberDto.getPhone());
        member.setAddress(memberDto.getAddress());
        member.setGender(memberDto.getGender());
        member.setMessageAgree(memberDto.isMessageAgree());

        notificationService.sendMember(member.getId(), "회원정보가 수정되었습니다.", "/mypage/info");
    }

    @Override
    public boolean checkPassword(String userEmail, String rawPassword) {
        MemberEntity member = memberRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return passwordEncoder.matches(rawPassword, member.getUserPw());
    }

    @Override
    @Transactional
    public void updatePassword(String email, String newPassword) {
        MemberEntity member = memberRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원 정보입니다."));

        String encodedPassword = passwordEncoder.encode(newPassword);
        member.setUserPw(encodedPassword);

        notificationService.sendMember(member.getId(), "비밀번호가 변경되었습니다.", "/mypage/pwChange");
    }

    @Override
    @Transactional
    public void delete(String email) {
        MemberEntity member = memberRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("탈퇴하려는 회원 정보를 찾을 수 없습니다."));

        // 1. S3에서 지울 파일명 미리 변수에 저장
        String filePathToDelete = null;
        if (member.getMemberFileEntity() != null) {
            filePathToDelete = member.getMemberFileEntity().getNewFileName();
        }

        // 2. DB 삭제 먼저 수행
        refreshTokenRepository.deleteById(email);
        memberRepository.delete(member);
        
        // DB 쿼리를 강제로 반영하여 외래키 예외 등 트랜잭션 정상 여부를 먼저 검증
        memberRepository.flush();

        // 3. DB 삭제까지 문제없이 완료된 경우 S3 파일 삭제 (예외 처리 추가)
        if (filePathToDelete != null) {
            try {
                deleteS3CustomFile(filePathToDelete);
            } catch (Exception e) {
                log.error("S3 프로필 이미지 삭제 실패 (회원 탈퇴는 진행됨): {}", e.getMessage());
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MemberDto getProfile(String userEmail) {
        MemberEntity member = memberRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        MemberDto dto = new MemberDto();
        dto.setMemberDetail(member.getMemberDetail());
        dto.setHikingLevel(member.getHikingLevel());
        if (member.getMemberFileEntity() != null) {
            dto.setNewFileName(member.getMemberFileEntity().getNewFileName());
        }
        return dto;
    }

    /**
     * 프로필 데이터 전용 수정 및 S3 파일 삭제/업로드 처리
     */
    @Override
    @Transactional
    public Map<String, Object> updateProfileData(String email, MemberDto memberDto) {
        MemberEntity member = memberRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 1. 일반 텍스트 정보 변경
        member.setMemberDetail(memberDto.getMemberDetail());
        member.setHikingLevel(memberDto.getHikingLevel());

        String oldProfileImg = (member.getMemberFileEntity() != null) ? member.getMemberFileEntity().getNewFileName() : null;
        String newProfileImgPath = oldProfileImg;

        // 2. 프로필 이미지 분기 처리
        if ("default".equals(memberDto.getProfileType())) {
            // [Case A] 기본 이미지 선택
            newProfileImgPath = "/images/" + memberDto.getDefaultImageName();

            // 기존에 업로드했던 S3 커스텀 파일 삭제
            deleteS3CustomFile(oldProfileImg);

        } else if ("custom".equals(memberDto.getProfileType())) {
            // [Case B] 커스텀 파일 새로 업로드
            MultipartFile file = memberDto.getProfileFile();

            if (file != null && !file.isEmpty()) {
                // 기존 S3 파일 삭제 처리
                deleteS3CustomFile(oldProfileImg);

                // S3에 새 이미지 업로드 (IOException 예외 처리 추가)
                try {
                    newProfileImgPath = s3UploadService.upload(file, "member");
                } catch (IOException e) {
                    log.error("S3 프로필 이미지 업로드 중 오류 발생: ", e);
                    throw new RuntimeException("프로필 사진 파일 업로드 중 오류가 발생했습니다.");
                }
            }
        }

        MemberFileEntity profileFileEntity = member.getMemberFileEntity();

        if (profileFileEntity == null) {
            profileFileEntity = MemberFileEntity.builder()
                    .memberEntity(member)
                    .build();

            member.setMemberFileEntity(profileFileEntity);
        }

        profileFileEntity.setNewFileName(newProfileImgPath);

        if ("default".equals(memberDto.getProfileType())) {
            profileFileEntity.setOldFileName(memberDto.getDefaultImageName());
            member.setAttachFile(false);
        } else if ("custom".equals(memberDto.getProfileType())) {
            MultipartFile file = memberDto.getProfileFile();

            if (file != null && !file.isEmpty()) {
                profileFileEntity.setOldFileName(file.getOriginalFilename());
                member.setAttachFile(true);
            }
        }

        memberRepository.save(member);

        // 3. 토큰 재발행
        String newAccessToken = jwtUtil.createToken(
                member.getUserEmail(),
                member.getRole().toString(),
                newProfileImgPath,
                ACCESS_TOKEN_EXPIRATION);

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", newAccessToken);
        result.put("accessTokenExpirationTime", ACCESS_TOKEN_EXPIRATION);
        result.put("updatedProfileImg", newProfileImgPath);

        log.info("[프로필 변경 완료] 유저: {}, 새 이미지 경로: {}", email, newProfileImgPath);

        notificationService.sendMember(member.getId(), "프로필이 변경되었습니다.", "/mypage/profileChange");

        return result;
    }

    /**
     * S3 저장소 기존 커스텀 파일 삭제 처리 전용 메서드
     */
    private void deleteS3CustomFile(String filePath) {
        if (filePath == null || filePath.isBlank() || filePath.startsWith("images/") || filePath.startsWith("/images/")) {
            return;
        }

        try {
            s3UploadService.deleteFile(filePath);
        } catch (Exception e) {
            log.error("S3 기존 프로필 파일 삭제 중 오류 발생. path={}", filePath, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TempSocialUserDto getTempSocialInfo(String ticket) {
        TempSocialUserDto tempUser = oAuth2TempStore.get(ticket);
        if (tempUser == null) {
            throw new IllegalArgumentException("만료되었거나 올바르지 않은 가입 세션입니다.");
        }
        return tempUser;
    }

    @Override
    @Transactional
    public ResponseEntity<?> registerOAuth2Member(MemberDto dto, MultipartFile profileFile) {
        // 1) 임시 티켓 검증 및 소셜 원본 데이터 가져오기
        TempSocialUserDto tempUser = oAuth2TempStore.get(dto.getTicket());
        if (tempUser == null) {
            throw new IllegalArgumentException("잘못되거나 만료된 가입 요청입니다.");
        }

        // 2) 새로운 멤버 엔티티 빌드업
        MemberEntity newSocialMember = MemberEntity.builder()
                .userEmail(tempUser.getUserEmail())
                .userName(dto.getUserName())
                .phone(dto.getPhone())
                .gender(dto.getGender())
                .address(dto.getAddress())
                .memberDetail(dto.getMemberDetail())
                .hikingLevel(dto.getHikingLevel())
                .messageAgree(dto.isMessageAgree())
                .provider(tempUser.getProvider())
                .role(Role.JUNIOR)
                .userPw(passwordEncoder.encode(dto.getUserPw()))
                .build();

        // 3) S3 활용 프로필 이미지 분기 처리
        if ("custom".equals(dto.getProfileType()) && profileFile != null && !profileFile.isEmpty()) {
            newSocialMember.setAttachFile(true);

            // S3 업로드 실행 (IOException 예외 처리 추가)
            String uploadedUrl;
            try {
                uploadedUrl = s3UploadService.upload(profileFile, "member");
            } catch (IOException e) {
                log.error("소셜 회원가입 프로필 이미지 업로드 중 오류 발생: ", e);
                throw new RuntimeException("프로필 사진 파일 업로드 중 오류가 발생했습니다.");
            }

            MemberFileEntity memberFileEntity = MemberFileEntity.builder()
                    .oldFileName(profileFile.getOriginalFilename())
                    .newFileName(uploadedUrl)
                    .memberEntity(newSocialMember)
                    .build();

            newSocialMember.setMemberFileEntity(memberFileEntity);

        } else if (dto.getDefaultImageName() != null && !dto.getDefaultImageName().isBlank()) {
            newSocialMember.setAttachFile(false);

            MemberFileEntity memberFileEntity = MemberFileEntity.builder()
                    .oldFileName(dto.getDefaultImageName())
                    .newFileName("/images/" + dto.getDefaultImageName())
                    .memberEntity(newSocialMember)
                    .build();

            newSocialMember.setMemberFileEntity(memberFileEntity);
        }

        // 4) DB 최종 영속화 및 Redis/메모리 임시 티켓 파기
        memberRepository.save(newSocialMember);
        oAuth2TempStore.remove(dto.getTicket());

        // 5) 토큰에 서명 및 주입할 저장된 실제 이미지 경로 추출
        String profileImg = "";
        if (newSocialMember.getMemberFileEntity() != null) {
            profileImg = newSocialMember.getMemberFileEntity().getNewFileName();
        }

        // 6) JWT 토큰 생성
        String accessToken = jwtUtil.createToken(
                newSocialMember.getUserEmail(),
                newSocialMember.getRole().name(),
                profileImg,
                ACCESS_TOKEN_EXPIRATION);
        String refreshToken = jwtUtil.createToken(
                newSocialMember.getUserEmail(),
                newSocialMember.getRole().name(),
                profileImg,
                REFRESH_TOKEN_EXPIRATION);

        // 7) Refresh Token 저장
        refreshTokenRepository.save(RefreshToken.builder()
                .userEmail(newSocialMember.getUserEmail())
                .refreshToken(refreshToken)
                .expiration(REFRESH_TOKEN_EXPIRATION / 1000)
                .build());

        LoginDto loginDto = LoginDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userEmail(newSocialMember.getUserEmail())
                .userName(newSocialMember.getUserName())
                .role(newSocialMember.getRole())
                .accessTokenExpirationTime(ACCESS_TOKEN_EXPIRATION)
                .build();

        return ResponseEntity.ok(loginDto);
    }
}