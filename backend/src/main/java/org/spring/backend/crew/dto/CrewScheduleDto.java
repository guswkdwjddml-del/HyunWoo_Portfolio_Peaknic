package org.spring.backend.crew.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrewScheduleDto {
    private Long id;
    private Long crewId;
    private String scheduleTime;
    private String title;
    private String description;
    private Integer sortOrder;
}