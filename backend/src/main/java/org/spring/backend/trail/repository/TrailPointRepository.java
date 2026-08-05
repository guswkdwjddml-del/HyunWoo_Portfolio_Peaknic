package org.spring.backend.trail.repository;

import java.util.List;

import org.spring.backend.trail.entity.TrailPointEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrailPointRepository extends JpaRepository<TrailPointEntity,Long> {

  List<TrailPointEntity> findByHikingRecordIdOrderByRecordedAtAsc(Long recordId);

}
