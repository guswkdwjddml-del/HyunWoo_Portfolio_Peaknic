package org.spring.backend.mountain.scheduler;

import org.spring.backend.mountain.service.MountainImageService;
import org.spring.backend.mountain.service.MountainImportService;
import org.spring.backend.trail.service.TrailImportService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.scheduler.mountain-sync", havingValue = "true")
public class MountainScheduler {

private final MountainImportService mountainImportService;
    private final MountainImageService mountainImageService;
    private final TrailImportService trailImportService;

    // 예: 매주 월요일 새벽 3시에 전체 데이터 동기화 파이프라인 실행
    @Scheduled(cron = "0 0 3 ? * MON")
    public void syncAllMountainDataPipeline() {
        log.info("========== [전체 산 정보 동기화 파이프라인 시작] ==========");

        // [1단계] 새로운 산이 있는지 1~50페이지 텍스트 긁어오기
        mountainImportService.syncAllMountainText();

        // [2단계] 이미지가 비어있는 산들만 골라서 카카오/산림청 이미지 채워넣기
        mountainImageService.syncAllMountainImages(); 

        // [3단계] (선택사항) 코스가 없는 산들만 골라서 VWorld API 찔러보기
        trailImportService.syncAllTrails(); 

        log.info("========== [전체 산 정보 동기화 파이프라인 완료] ==========");
    }
}
