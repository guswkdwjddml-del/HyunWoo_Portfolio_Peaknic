package org.spring.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularMountainDto {

  private Long id;
  private String mountainName;
  private String sido;
  private String sigungu;
  private Integer bookmarkCount;

}
