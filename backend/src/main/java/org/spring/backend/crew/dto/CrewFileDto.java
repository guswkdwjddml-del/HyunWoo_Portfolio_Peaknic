package org.spring.backend.crew.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewFileDto {
    private Long id;
    private String newFileName;
    private String oldFileName;
    private String filePath;
}