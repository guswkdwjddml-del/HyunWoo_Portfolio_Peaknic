package org.spring.backend.mountain.dto;

import org.spring.backend.mountain.entity.MountainEntity;
import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ========= 산 목록 DTO ===============//
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MountainDto {
    private Long id;

    private Long mountainCode;

    private String mountainName;

    private Integer height;

    private String location;

    private String sido;

    private String sigungu;

    private String management;

    private String imageUrl;
    
    // ============ 관리자페이지 산 이미지 수정용(추가_sun) ==============//
    private MultipartFile mountainFile;
    // 기존 파일(이미지)용
    private Boolean deleteFile;
    private String oldFileName;
    private String newFileName;
    // ======================================================= //

    private String description;

    private String hundredReason;

    private String recommendCourse;

    private boolean hasTrail;

    private int bookmarkCount;

    private boolean isBookmarked;

    //리뷰 작성 가능한 산 목록 받아오기
    public static MountainDto toMountainDto(MountainEntity mountain) {
            return MountainDto.builder()
            .id(mountain.getId()) //산 id
            .mountainName(mountain.getMountainName()) //산 이름 
            .build();
    }

}
