package org.spring.backend.mountain.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.spring.backend.mountain.service.MountainImageService;
import org.spring.backend.mountain.service.MountainImportService;
import org.spring.backend.trail.service.TrailImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/mountain")
@RequiredArgsConstructor
@Slf4j
public class MountainImportController {

    // localhost:8088/api/admin/mountain/text
    // localhost:8088/api/admin/mountain/image
    // localhost:8088/api/admin/mountain/trail

    // 3개의 분리된 서비스를 모두 주입
    private final MountainImportService mountainImportService;
    private final MountainImageService mountainImageService;
    private final TrailImportService trailImportService;

    // 1. 산림청 텍스트 수집
    @PostMapping("/text")
    public ResponseEntity<String> syncAllMountainText() {
        log.info("관리자 요청: 전체 산 텍스트 정보 수집 시작");
        // 타임아웃(500 에러) 방지를 위해 백그라운드에서 실행
        new Thread(() -> mountainImportService.syncAllMountainText()).start();
        return ResponseEntity.ok("산 텍스트 정보 수집이 백그라운드에서 시작되었습니다. 백엔드 터미널을 확인해주세요.");
    }

    // 2. 카카오/산림청 이미지 수집
    @PostMapping("/image")
    public ResponseEntity<String> syncAllMountainImages() {
        log.info("관리자 요청: 전체 산 이미지 수집 시작");
        new Thread(() -> mountainImageService.syncAllMountainImages()).start();
        return ResponseEntity.ok("산 이미지 수집이 백그라운드에서 시작되었습니다.");
    }

    // 3. VWorld 등산로 수집 (요청하신 /trail 주소 매핑)
    @PostMapping("/trail")
    public ResponseEntity<String> syncAllTrails() {
        log.info("관리자 요청: 전체 등산 코스 수집 시작");
        // 80분이 걸려도 프론트엔드가 뻗지 않도록 백그라운드로 넘깁니다.
        new Thread(() -> trailImportService.syncAllTrails()).start();
        return ResponseEntity.ok("등산 코스 수집이 백그라운드에서 시작되었습니다. 터미널 로그를 확인해주세요.");
    }
}