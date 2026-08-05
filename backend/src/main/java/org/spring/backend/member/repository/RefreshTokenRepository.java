package org.spring.backend.member.repository;

import org.spring.backend.member.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;

// CrudRepository<엔티티타입, Id의타입> 을 상속받습니다.
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {


    
}