package org.spring.backend.crew.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.settlement.service.SettlementService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CrewScheduler { // yein 작성

  private final CrewRepository crewRepository;
  private final PaymentItemRepository paymentItemRepository;
  private final SettlementService settlementService;

  // 모집 마감 처리 -> 1분마다 실행
  @Scheduled(cron = "0 * * * * *")
  @Transactional
  public void closeCrews() {
    // 1. 인원 충족 -> 벌크 업데이트로 CLOSED 처리
    int closedCount = crewRepository.changeCloseCrews();
    if (closedCount > 0) {
      System.out.println("마감된 크루: " + closedCount + "개");
    }

    // 2. 인원 미달 -> 하나씩 환불 처리
    List<CrewEntity> refundTargets = crewRepository.findRefundCrewsUnderMinPeople();
    for (CrewEntity crewEntity : refundTargets) {
      settlementService.refundAll(crewEntity);
    }
    if (!refundTargets.isEmpty()) {
      System.out.println("인원 미달로 환불된 크루: " + refundTargets.size() + "개");
    }
  }

  // 참여 확정 처리 -> 1분마다 실행
  @Scheduled(cron = "0 * * * * *")
  @Transactional
  public void completeCrews() {
    // 크루 상태 CLOSED + 크루 활동 끝난 크루 불러오기
    List<CrewEntity> completeTargets = crewRepository.findAllByCrewStatusAndCrewEndDateBefore(
        CrewStatus.CLOSED, LocalDateTime.now());

    // 크루 참여 확정 -> 정산 준비
    for (CrewEntity crewEntity : completeTargets) {
      // 모든 크루원이 참여 확정 버튼 눌렀는지 확인
      boolean allConfirmed = !paymentItemRepository
          .existsByCrewEntityIdAndParticipationConfirmedFalse(crewEntity.getId());

      // 안 눌렀으면 3일 뒤 자동 참여 확정 처리
      boolean daysPassed = crewEntity.getCrewEndDate().plusDays(3).isBefore(LocalDateTime.now());

      // 참여 확정 확인 후 크루 상태 COMPLETED로 변경 및 정산 준비
      if (allConfirmed || daysPassed) {
        crewEntity.setCrewStatus(CrewStatus.COMPLETED);
        settlementService.settleReady(crewEntity);
      }
    }
  }

}
