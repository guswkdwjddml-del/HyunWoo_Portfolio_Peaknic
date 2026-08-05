package org.spring.backend.settlement.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.CancelReason;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.LedgerType;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.common.SettlementStatus;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.ledger.entity.LedgerEntity;
import org.spring.backend.ledger.repository.LedgerRepository;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.payment.service.RefundService;
import org.spring.backend.settlement.entity.SettlementEntity;
import org.spring.backend.settlement.repository.SettlementRepository;
import org.spring.backend.settlement.service.SettlementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService { // yein 작성

  private final PaymentItemRepository paymentItemRepository;
  private final SettlementRepository settlementRepository;
  private final LedgerRepository ledgerRepository;
  private final NotificationService notificationService;
  private final RefundService refundService;

  // 정산 준비 -> 실제 정산 처리(원장 기록)은 관리자가 진행 => 스케쥴러에서 실행
  @Override
  @Transactional
  public void settleReady(CrewEntity crewEntity) {
    // 이미 해당 크루의 정산 건이 존재한다면 return
    if (settlementRepository.findByCrewEntityId(crewEntity.getId()).isPresent()) {
      return;
    }

    // 결제 완료 상태인 해당 크루의 결제 상세 내역 불러오기
    List<PaymentItemEntity> paymentItemEntities = paymentItemRepository
        .findAllByCrewEntityIdAndPaymentEntityPaymentStatus(crewEntity.getId(), PaymentStatus.FINISH);

    // 크루원들이 낸 총 결제 금액
    int totalAmount = paymentItemEntities.stream().mapToInt(PaymentItemEntity::getCurrentPrice).sum();

    // 수수료 (5%)
    int feeAmount = (int) (totalAmount * 0.05);

    // 크루장에게 지급할 금액 (95%)
    int payoutAmount = totalAmount - feeAmount;

    // 정산 준비
    settlementRepository.save(SettlementEntity.builder()
        .totalAmount(totalAmount)
        .feeAmount(feeAmount)
        .payoutAmount(payoutAmount)
        .settlementStatus(SettlementStatus.PENDING)
        .crewEntity(crewEntity)
        .build());
  }

  // 정산 완료 -> 관리자가 크루장에게 입금 -> 장부(Ledger) 기록
  @Override
  @Transactional
  public void settleComplete(Long settlementId) {
    // 정산 내역 있는지 확인
    SettlementEntity settlementEntity = settlementRepository.findById(settlementId)
        .orElseThrow(() -> new IllegalArgumentException("정산 내역이 존재하지 않습니다."));

    // 처리할 정산 내역 있는지 확인
    if (settlementEntity.getSettlementStatus() != SettlementStatus.PENDING) {
      throw new IllegalStateException("해당 정산은 이미 처리되었습니다.");
    }

    // COMPLETED 상태로 변경 / 변경 시간 기록
    settlementEntity.complete();

    // 장부(Ledger) 기록
    ledgerRepository.save(LedgerEntity.builder()
        .ledgerType(LedgerType.SETTLEMENT_PAYOUT)
        .amount(-settlementEntity.getPayoutAmount())
        .description(settlementEntity.getCrewEntity().getCrewName() + " 크루장 정산 완료")
        .build());

    // 정산 완료 후 크루장에게 알림 전송
    notificationService.sendPayment(settlementEntity.getCrewEntity().getMemberEntity().getId(),
        settlementEntity.getCrewEntity().getCrewName() + " 크루 정산이 완료되었습니다.", "/payment/list?tab=CREW");
  }

  // 크루 인원 미달시 전원 환불 -> 장부(Ledger) 기록 => 스케쥴러에서 실행
  @Override
  @Transactional
  public void refundAll(CrewEntity crewEntity) {
    // 결제 완료 상태인 해당 크루의 결제 상세 내역 불러오기
    List<PaymentItemEntity> paymentItemEntities = paymentItemRepository
        .findAllByCrewEntityIdAndPaymentEntityPaymentStatus(crewEntity.getId(), PaymentStatus.FINISH);

    for (PaymentItemEntity item : paymentItemEntities) {
      // 환불 처리가 된 요청들은 바로 패스
      if (item.getRefundStatus() != RefundStatus.NONE) {
        continue;
      }

      // 환불 상태로 변경
      item.setCancelReason(CancelReason.MIN_PEOPLE_CANCEL);
      item.setRefundRate(BigDecimal.ONE);
      item.setRefundRequestTime(LocalDateTime.now());

      // 실제 환불 코드 호출
      refundService.refundProcess(item, item.getCrewEntity().getCrewName()
          + " 크루 인원 미달 환불 (" + item.getPaymentEntity().getOrderNumber() + ")");
    }

    // 크루 상태 CANCELLED로 변경
    crewEntity.setCrewStatus(CrewStatus.CANCELLED);
  }

}
