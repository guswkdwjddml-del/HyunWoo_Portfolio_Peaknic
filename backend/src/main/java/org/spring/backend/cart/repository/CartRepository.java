package org.spring.backend.cart.repository;

import java.util.Optional;

import org.spring.backend.cart.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<CartEntity, Long> { // yein 작성

  Optional<CartEntity> findByMemberEntityId(Long id);

}
