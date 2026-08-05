package org.spring.backend.mountain.controller;

import java.util.List;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.mountain.dto.MountainDto;
import org.spring.backend.mountain.service.MountainReviewService;
import org.spring.backend.mountain.service.MountainService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@RestController
@RequestMapping("/api/mountains")
@RequiredArgsConstructor
public class MountainController {

    private final MountainService mountainService;
    private final MountainReviewService mountainReviewService;

    // 산 정보 가져오기
    @GetMapping("/search")
    public ResponseEntity<Page<MountainDto>> searchMountains(
            @RequestParam(value = "memberId", required = false) Long memberId,
            @RequestParam(value = "sido", required = false, defaultValue = "") String sido,
            @RequestParam(value = "sigungu", required = false, defaultValue = "") String sigungu,
            @RequestParam(value = "mountainName", required = false, defaultValue = "") String mountainName,
            @PageableDefault(size = 9) Pageable pageable) {

        Page<MountainDto> result = mountainService.searchMountains(memberId, sido, sigungu, mountainName, pageable);
        return ResponseEntity.ok(result);
    }

    // 산 상세 정보 가져오기
    @GetMapping("/{id}")
    public ResponseEntity<MountainDto> getMountainById(@PathVariable("id") Long id) {
        MountainDto result = mountainService.getMountainById(id);
        return ResponseEntity.ok(result);
    }

    // 해당 산(mountainId)에 달린 리뷰(REVIEW) 게시글 목록을 조회하여 반환합니다.
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<BoardDto>> getMountainReviews(@PathVariable("id") Long id) {

        List<BoardDto> reviews = mountainReviewService.mountainReview(id);

        // 정상 상태(200 OK)와 함께 리뷰 데이터를 응답
        return ResponseEntity.ok(reviews);
    }
    

}
