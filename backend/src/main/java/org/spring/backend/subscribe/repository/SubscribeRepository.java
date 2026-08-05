package org.spring.backend.subscribe.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.spring.backend.common.SubscribeStatus;
import org.spring.backend.subscribe.entity.SubscribeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscribeRepository extends JpaRepository<SubscribeEntity, Long> { // yein 작성

  boolean existsByMemberEntityIdAndSubscribeStatus(Long memberId, SubscribeStatus subscribeStatus);

  List<SubscribeEntity> findAllByMemberEntityIdAndSubscribeStatus(Long memberId, SubscribeStatus subscribeStatus);

  Optional<SubscribeEntity> findByPaymentEntityId(Long id);

  List<SubscribeEntity> findAllBySubscribeStatusAndSubscribeExpireTimeBefore(SubscribeStatus active, LocalDateTime now);

  Optional<SubscribeEntity> findByMemberEntityIdAndSubscribeStatus(Long memberId, SubscribeStatus subscribeStatus);

  Page<SubscribeEntity> findAllByMemberEntityIdAndPaymentEntityHiddenFalseOrderByCreateTimeDesc(Long id,
      Pageable pageable);

  //================== 관리자페이지 결제관리용(추가_sun) ======================
  SubscribeEntity findByPaymentEntity_Id(Long id);

}
