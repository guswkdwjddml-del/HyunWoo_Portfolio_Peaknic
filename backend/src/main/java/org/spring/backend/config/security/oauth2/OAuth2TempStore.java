package org.spring.backend.config.security.oauth2;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class OAuth2TempStore {
    // 5~10분의 짧은 생명주기를 가진 캐시 저장소로 실무 변환 가능 (여기서는 ConcurrentHashMap 사용)
    private final Map<String, TempSocialUserDto> tempCache = new ConcurrentHashMap<>();

    public void put(String ticket, TempSocialUserDto dto) {
        tempCache.put(ticket, dto);
    }

    public TempSocialUserDto get(String ticket) {
        return tempCache.get(ticket);
    }

    public void remove(String ticket) {
        tempCache.remove(ticket);
    }
}