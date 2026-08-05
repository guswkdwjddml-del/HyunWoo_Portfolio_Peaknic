package org.spring.backend.customcourse.service;

import org.spring.backend.customcourse.dto.CustomCourseDto;

public interface CustomCourseService {
    // 코스 저장
    Long saveCustomCourse(CustomCourseDto dto);
    
    // 코스 수정
    void updateCustomCourse(Long id, CustomCourseDto dto);
    
    // 코스 조회
    CustomCourseDto getCustomCourseById(Long id);

}