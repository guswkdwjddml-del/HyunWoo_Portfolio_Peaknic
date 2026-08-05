package org.spring.backend.ledger.entity;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.LedgerType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "ledger_tb")
public class LedgerEntity extends BasicTime { // yein 작성

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id; // 아이디 (PK)

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private LedgerType ledgerType; // 플랫폼 장부 거래 종류

  @Column(nullable = false)
  private int amount; // 입금(+) / 출금(-) -> 전체 잔액: sum()

  private Long relatedPaymentId; // 어떤 결제 건과 연결된 거래인지 추적용

  @Column(length = 255)
  private String description; // 설명 (어떤 크루 정산/환불 완료)

}
