package org.spring.backend.trail.repository;

import java.util.List;

import org.spring.backend.trail.entity.TrailEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrailRepository extends JpaRepository<TrailEntity, Long> {
  List<TrailEntity> findByMountainId(Long mountainId);
}