package org.spring.backend.customcourse.controller;


import org.spring.backend.customcourse.dto.CustomCourseDto;
import org.spring.backend.customcourse.service.CustomCourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/custom-courses")
@RequiredArgsConstructor
public class CustomCourseController {

    private final CustomCourseService customCourseService;

    // 코스 생성
    @PostMapping
    public ResponseEntity<Long> saveCustomCourse(@RequestBody CustomCourseDto dto) {
        Long savedId = customCourseService.saveCustomCourse(dto);
        return ResponseEntity.ok(savedId);
    }

    // 코스 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updateCustomCourse(@PathVariable("id") Long id, @RequestBody CustomCourseDto dto) {
        customCourseService.updateCustomCourse(id, dto);
        return ResponseEntity.ok("코스 수정 완료");
    }

    // 코스 조회
    @GetMapping("/{id}")
    public ResponseEntity<CustomCourseDto> getCustomCourse(@PathVariable("id") Long id) {
        CustomCourseDto dto = customCourseService.getCustomCourseById(id);
        return ResponseEntity.ok(dto);
    }
}