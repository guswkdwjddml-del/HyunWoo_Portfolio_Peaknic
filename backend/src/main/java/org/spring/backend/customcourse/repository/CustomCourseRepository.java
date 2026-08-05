package org.spring.backend.customcourse.repository;

import org.spring.backend.customcourse.entity.CustomCourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomCourseRepository extends JpaRepository<CustomCourseEntity,Long> {

}
