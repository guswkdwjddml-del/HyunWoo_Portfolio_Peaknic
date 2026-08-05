package org.spring.backend.payment.policy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.spring.backend.crew.entity.CrewEntity;
import org.springframework.stereotype.Component;

@Component
public class RefundPolicyCalculator { // yein 작성

  private static final BigDecimal RATE_100 = new BigDecimal("1.0");
  private static final BigDecimal RATE_90 = new BigDecimal("0.9");
  private static final BigDecimal RATE_70 = new BigDecimal("0.7");
  private static final BigDecimal RATE_50 = new BigDecimal("0.5");
  private static final BigDecimal RATE_20 = new BigDecimal("0.2");
  private static final BigDecimal RATE_0 = BigDecimal.ZERO;

  // 크루원 자진취소 환불률 계산 (방장 취소는 항상 1.0)
  public BigDecimal calculateMemberCancelRate(CrewEntity crew, LocalDateTime now) {
    // 활동 시작 시간 이후 -> 환불 0%
    if (!now.isBefore(crew.getCrewStartDate())) {
      return RATE_0;
    }
    // 활동 모집 마감 시간 이전
    if (crew.getCrewDeadline() != null && now.isBefore(crew.getCrewDeadline())) {
      return RATE_100;
    }
    // 활동 시작 시간까지 남은 일수에 따른 환불률 저장
    long daysLeft = ChronoUnit.DAYS.between(now.toLocalDate(), crew.getCrewStartDate());
    if (daysLeft >= 10)
      return RATE_100;
    if (daysLeft >= 7)
      return RATE_90;
    if (daysLeft >= 5)
      return RATE_70;
    if (daysLeft >= 3)
      return RATE_50;
    return RATE_20;
  }

}
