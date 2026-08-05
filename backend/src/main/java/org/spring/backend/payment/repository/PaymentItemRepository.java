package org.spring.backend.payment.repository;

import java.util.List;

import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentItemRepository extends JpaRepository<PaymentItemEntity, Long> { // yein 작성

  List<PaymentItemEntity> findAllByPaymentEntityId(Long id);

  List<PaymentItemEntity> findAllByCrewEntityIdAndPaymentEntityPaymentStatus(Long id, PaymentStatus finish);

  boolean existsByCrewEntityIdAndParticipationConfirmedFalse(Long id);

  List<PaymentItemEntity> findAllByRefundStatus(RefundStatus refundStatus);

  boolean existsByPaymentEntityMemberEntityIdAndCrewEntityIdAndPaymentEntityPaymentStatusAndRefundStatus(Long id,
      Long id2, PaymentStatus finish, RefundStatus none);

}
