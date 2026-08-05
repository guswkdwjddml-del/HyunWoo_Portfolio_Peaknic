package org.spring.backend.mountain.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    @Value("${api.kakao.map-key}") // 백엔드에만 숨겨둔 키
    private String kakaoMapKey;

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> getMapKey() {
        return ResponseEntity.ok(Map.of("kakaoMapKey", kakaoMapKey));
    }
}