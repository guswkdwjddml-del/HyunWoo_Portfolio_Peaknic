package org.spring.backend.admin.dto;

import java.time.LocalDateTime;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.SettlementStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCrewDto {

  // 크루 정보
  private Long id;
  private String crewName;
  private int crewPrice;
  private int crewPeople;
  private int currentPeople;

  private LocalDateTime crewDeadline;
  private LocalDateTime crewStartDate;

  private CrewStatus crewStatus;

  // 산 정보
  private Long mountainId;
  private String mountainName;

  // 크루장 정보
  private Long memberId;
  private String userName;

  // 정산 정보
  private Long settlementId;
  private SettlementStatus settlementStatus;
  private int totalAmount; // 크루원들이 낸 총 결제 금액
  private int feeAmount; // 수수료 (5%)
  private int payoutAmount; // 크루장에게 지급할 금액 (95%)
  private LocalDateTime completedTime; // 관리자가 입금 처리한 시간

}
