package org.spring.backend.cart.repository;

import java.util.List;

import org.spring.backend.cart.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> { // yein 작성

  boolean existsByCartEntityIdAndCrewEntityId(Long id, Long id2);

  List<CartItemEntity> findAllByCartEntityId(Long id);

  List<CartItemEntity> findAllByIdInAndCartEntityMemberEntityId(List<Long> ids, Long id);

  void deleteAllByCartEntityMemberEntityIdAndCrewEntityIdIn(Long id, List<Long> paymentCrewIds);

  List<CartItemEntity> findAllByCartEntityMemberEntityIdAndCrewEntityIdIn(Long id, List<Long> paymentCrewIds);

}
