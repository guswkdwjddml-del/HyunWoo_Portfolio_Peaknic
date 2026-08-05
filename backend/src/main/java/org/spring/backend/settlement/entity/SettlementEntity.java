package org.spring.backend.settlement.entity;

import java.time.LocalDateTime;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.SettlementStatus;
import org.spring.backend.crew.entity.CrewEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "settle_tb")
public class SettlementEntity extends BasicTime { // yein 작성

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id; // 아이디 (PK)

  @Column(nullable = false)
  private int totalAmount; // 크루원들이 낸 총 결제 금액

  @Column(nullable = false)
  private int feeAmount; // 수수료 (5%)

  @Column(nullable = false)
  private int payoutAmount; // 크루장에게 지급할 금액 (95%)

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private SettlementStatus settlementStatus; // 정산 상태

  private LocalDateTime completedTime; // 관리자가 입금 처리한 시간

  // 1:1 (Crew) -> 크루 1개당 정산 1건
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "crew_id", nullable = false, unique = true)
  private CrewEntity crewEntity;

  // 정산 완료 함수
  public void complete() {
    this.settlementStatus = SettlementStatus.COMPLETED;
    this.completedTime = LocalDateTime.now();
  }

}
