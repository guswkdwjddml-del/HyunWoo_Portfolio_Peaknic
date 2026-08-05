package org.spring.backend.mountain.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

//=========== 산림청 XML 형식 받는 DTO =================// 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@ToString
public class ForestMountainApiDto {
// 산코드
    @JacksonXmlProperty(localName = "mntilistno")
    private Long mountainCode;

    // 산명
    @JacksonXmlProperty(localName = "mntiname")
    private String mountainName;

    // 높이
    @JacksonXmlProperty(localName = "mntihigh")
    private String height;

    // 소재지
    @JacksonXmlProperty(localName = "mntiadd")
    private String location;

    // 관리기관
    @JacksonXmlProperty(localName = "mntiadmin")
    private String management;

    // 산 소개
    @JacksonXmlProperty(localName = "mntidetails")
    private String description;

    private String imageUrl;
    private String hundredReason;
    private String recommendCourse;
}
