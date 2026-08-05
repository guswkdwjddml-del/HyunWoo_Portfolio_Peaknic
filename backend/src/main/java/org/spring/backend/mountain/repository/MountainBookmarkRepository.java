package org.spring.backend.mountain.repository;

import java.util.Optional;

import org.spring.backend.mountain.entity.MountainBookmarkEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MountainBookmarkRepository extends JpaRepository<MountainBookmarkEntity,Long> {
  
    // 회원id,mountainId 대조
    Optional<MountainBookmarkEntity> findByMemberEntity_UserEmailAndMountainEntity_Id(String userEmail, Long mountainId);

    // 북마크했는지 true/false
    boolean existsByMemberEntity_UserEmailAndMountainEntity_Id(String userEmail, Long mountainId);

}