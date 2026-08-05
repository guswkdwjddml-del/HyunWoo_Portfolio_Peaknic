package org.spring.backend.hikingrecord.repository;

import org.spring.backend.hikingrecord.entity.HikingRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HikingRecordRepository extends JpaRepository<HikingRecordEntity,Long>{

}
