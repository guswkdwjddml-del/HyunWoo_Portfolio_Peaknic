package org.spring.backend.crew.repository;

import java.util.List;

import org.spring.backend.crew.entity.CrewFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrewFileRepository extends JpaRepository<CrewFileEntity, Long> { // yein 작성

  List<CrewFileEntity> findAllByCrewEntityIdIn(List<Long> crewIds);

}
