package org.spring.backend.member.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ProfileUpdateDto {

    private MultipartFile profileFile;

    private String profileType;
    
    private String defaultImageName;
    
}
