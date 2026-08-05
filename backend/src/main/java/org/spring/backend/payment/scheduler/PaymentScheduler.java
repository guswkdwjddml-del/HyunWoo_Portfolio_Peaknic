package org.spring.backend.payment.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.payment.repository.PaymentRepository;
import org.spring.backend.payment.service.RefundService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PaymentScheduler { // yein 작성

  private final PaymentRepository paymentRepository;
  private final PaymentItemRepository paymentItemRepository;
  private final RefundService refundService;

  // 최대 재시도 횟수
  private static final int MAX_RETRY = 5;

  // 결제 상태 만료 처리 -> 10분마다 실행
  @Scheduled(cron = "0 */10 * * * *")
  @Transactional
  public void expireReadyPayments() {
    // 현재 시간 기준 어제
    LocalDateTime expireTime = LocalDateTime.now().minusDays(1);

    // ~ 현재 시간 기준 어제 까지 쌓인 Ready 상태 결제 내역
    List<PaymentEntity> readyPayments = paymentRepository
        .findByPaymentStatusAndPaymentTypeAndCreateTimeBefore(PaymentStatus.READY, PaymentType.KAKAO, expireTime);

    // 만료(EXPIRED) 상태로 변경
    for (PaymentEntity paymentEntity : readyPayments) {
      paymentEntity.setPaymentStatus(PaymentStatus.EXPIRED);
    }

    if (readyPayments.size() > 0) {
      System.out.println("만료된 크루: " + readyPayments.size() + "개");
    }
  }

  // 카카오페이 환불 재시도 -> 10분마다 실행
  @Scheduled(cron = "0 */10 * * * *")
  @Transactional
  public void retryFailedRefunds() {
    // 환불 상태가 실패인 결제 상세 내역 불러오기
    List<PaymentItemEntity> failedItems = paymentItemRepository.findAllByRefundStatus(RefundStatus.REFUND_FAILED);

    for (PaymentItemEntity item : failedItems) {
      // 최대 재시도 횟수 초과시 패스 -> 나중에 관리자한테 알림 전송하기
      if (item.getRefundRetryCount() >= MAX_RETRY) {
        System.out.println("환불 재시도 한도 초과 - 관리자 확인 필요. paymentItemId=" + item.getId());
        continue;
      }
      refundService.refundProcess(item, "환불 재시도 (" + item.getPaymentEntity().getOrderNumber() + ")");
    }
  }

}
