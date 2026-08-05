package org.spring.backend.mountain.controller;

import lombok.RequiredArgsConstructor;
import org.spring.backend.mountain.service.MountainBookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks/mountain")
public class MountainBookmarkController {

    private final MountainBookmarkService mountainBookmarkService;

    // [GET] 특정 산의 북마크 상태를 조회하는 메서드입니다.
    @GetMapping("/{mountainId}")
    public ResponseEntity<Map<String, Boolean>> isBookmarked(@PathVariable("mountainId") Long mountainId, Authentication authentication) {
        // 로그인한 유저의 이메일을 추출합니다.
        String userEmail = authentication.getName(); 
        Map<String, Boolean> response = mountainBookmarkService.isBookmarked(mountainId, userEmail);
        return ResponseEntity.ok(response);
    }

    // [POST] 특정 산의 북마크를 추가하거나 취소하는 토글 메서드입니다.
    @PostMapping("/{mountainId}")
    public ResponseEntity<String> toggleBookmark(@PathVariable("mountainId") Long mountainId, Authentication authentication) {
        // 로그인한 유저의 이메일을 추출합니다.
        String userEmail = authentication.getName(); 
        mountainBookmarkService.toggleBookmark(mountainId, userEmail);
        return ResponseEntity.ok("북마크 처리가 완료되었습니다.");
    }
}