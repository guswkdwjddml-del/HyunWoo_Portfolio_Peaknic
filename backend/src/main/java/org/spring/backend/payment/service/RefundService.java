package org.spring.backend.payment.service;

import org.spring.backend.payment.entity.PaymentItemEntity;

public interface RefundService { // yein 작성

  // 실제 환불 실행 (크루 인원미달 / 모집취소 / 참가취소)
  void refundProcess(PaymentItemEntity item, String description);

}