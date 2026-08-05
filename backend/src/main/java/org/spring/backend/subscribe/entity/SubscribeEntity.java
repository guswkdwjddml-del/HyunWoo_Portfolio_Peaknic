package org.spring.backend.subscribe.entity;

import java.time.LocalDateTime;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.SubscribeStatus;
import org.spring.backend.common.SubscribeType;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.payment.entity.PaymentEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "subscribe_tb")
public class SubscribeEntity extends BasicTime { // yein 작성

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "subscribe_id")
  private Long id; // 아이디 (PK)

  @Enumerated(EnumType.STRING)
  private SubscribeType subscribeType; // 구독 타입 (가격, 구독일수)

  private int price; // 구독권 가격 -> subscribeType.getPrice

  @Enumerated(EnumType.STRING)
  private SubscribeStatus subscribeStatus; // 구독 상태

  private LocalDateTime paidTime; // 결제 시간 -> PaymentStatus.FINISH

  private LocalDateTime subscribeStartTime; // 구독 시작 시간 -> 결제 시간

  private LocalDateTime subscribeExpireTime; // 구독 만료 시간 -> plusDays(subscribeType.getDays)

  // N:1 (Member) -> 구독권 결제한 회원
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id")
  private MemberEntity memberEntity;

  // 1:1 (Payment) -> 구독권 결제 내역
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "payment_id", unique = true)
  private PaymentEntity paymentEntity;

}
