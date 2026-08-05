package org.spring.backend.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.common.Role;
import org.spring.backend.member.entity.MemberEntity;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
public class MemberDto {

    // 회원가입, 회원정보상세보기 에 사용될 DTO

    private String accessToken;

    private String refreshToken;

    private Long id;

    @Size(min = 3, max = 100, message = "3글자 이상이어야합니다.(필수)")
    private String userEmail;

    @Size(min = 4, max = 100, message = "4글자 이상이어야합니다.(필수)")
    private String userPw;

    @NotBlank(message = "이름을 입력해주세요.(필수)")
    private String userName;

    @Size(min = 10, max = 100, message = "10글자 이상이어야합니다.(필수)")
    private String phone;

    @NotBlank(message = "주소를 입력해주세요.(필수)")
    private String address;

    private String memberDetail; // 공백허용

    @NotBlank
    private String gender;

    private int hikingLevel; // 등산 레벨 (1 ~ 5)

    private Role role;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
    
    private boolean messageAgree;

    // 🌟 [프로필 사진 기능 추가 필드]

    private MultipartFile profileFile;  

    private String defaultImageName;

    private String profileType;

    private String oldFileName;         // 원본 파일 이름

    private String newFileName;         // 새 파일 이름 -> DB 저장

    private boolean attachFile;

    private String provider;

    private String ticket;

    // map-> 리스트 변환(추가_sun)
    public static MemberDto toMemberDto(MemberEntity memberEntity) {

        String storedName = null;
        // 🌟 1:1 관계이므로 리스트가 아닌 단일 객체에서 바로 파일명을 꺼냅니다.
        if (memberEntity.getMemberFileEntity() != null) {
            storedName = memberEntity.getMemberFileEntity().getNewFileName();
        }
        return MemberDto.builder()
                .id(memberEntity.getId())
                .userEmail(memberEntity.getUserEmail())
                .userName(memberEntity.getUserName())
                .phone(memberEntity.getPhone())
                .address(memberEntity.getAddress())
                .memberDetail(memberEntity.getMemberDetail())
                .gender(memberEntity.getGender())
                .hikingLevel(memberEntity.getHikingLevel())
                .messageAgree(memberEntity.isMessageAgree())
                .role(memberEntity.getRole())
                .attachFile(memberEntity.isAttachFile())
                .newFileName(storedName) 
                .createTime(memberEntity.getCreateTime())
                .updateTime(memberEntity.getUpdateTime())
                .provider(memberEntity.getProvider())
                .build();
    }


    
}
