package org.spring.backend.mountain.service;

import java.util.Map;

public interface MountainBookmarkService {
    
    // 특정 산의 북마크 상태(On/Off)를 확인하여 Map 형태로 반환
    Map<String, Boolean> isBookmarked(Long mountainId, String userEmail);

    // 북마크가 없으면 새로 추가하고, 이미 있다면 삭제(토글)
    void toggleBookmark(Long mountainId, String userEmail);
}
