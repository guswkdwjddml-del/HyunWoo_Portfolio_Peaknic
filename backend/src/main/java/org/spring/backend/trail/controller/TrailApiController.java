package org.spring.backend.trail.controller;

import java.util.List;

import org.spring.backend.trail.dto.TrailResponseDto;
import org.spring.backend.trail.service.TrailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trails")
@RequiredArgsConstructor
public class TrailApiController {

    private final TrailService trailService;


    // GET /api/trails/mountain/1
    @GetMapping("/mountain/{mountainId}")
    public ResponseEntity<List<TrailResponseDto>> getTrailsByMountainId(@PathVariable("mountainId") Long mountainId) {
        List<TrailResponseDto> result = trailService.getCoursesByMountainId(mountainId);
        return ResponseEntity.ok(result);
    }


}
