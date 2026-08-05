package org.spring.backend.subscribe.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.Role;
import org.spring.backend.common.SubscribeStatus;
import org.spring.backend.subscribe.entity.SubscribeEntity;
import org.spring.backend.subscribe.repository.SubscribeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SubscribeScheduler { // yein 작성

  private final SubscribeRepository subscribeRepository;

  // 구독 EXPIRED & 회원 JUNIOR -> 10분마다 실행
  // @Scheduled(cron = "0 */10 * * * *")
  @Scheduled(cron = "0 * * * * *")
  @Transactional
  public void expireActiveSubscribe() {
    // 구독 내역 불러오기 (ACTIVE 상태 && 구독 만료 시간 지남)
    List<SubscribeEntity> expireTargets = subscribeRepository
        .findAllBySubscribeStatusAndSubscribeExpireTimeBefore(SubscribeStatus.ACTIVE, LocalDateTime.now());

    if (expireTargets.isEmpty()) {
      return;
    }

    // 구독 상태 만료(EXPIRED) & 회원 권한(JUNIOR) 로 변경
    for (SubscribeEntity subscribeEntity : expireTargets) {
      subscribeEntity.setSubscribeStatus(SubscribeStatus.EXPIRED);
      subscribeEntity.getMemberEntity().setRole(Role.JUNIOR);
    }
  }

}
