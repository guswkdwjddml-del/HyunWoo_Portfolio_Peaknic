package org.spring.backend.admin.dto;

import org.spring.backend.common.CrewStatus;

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
public class CrewStatusChartDto {

  private CrewStatus status;

  private Long count;

}
