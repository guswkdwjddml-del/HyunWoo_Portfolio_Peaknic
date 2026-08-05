package org.spring.backend.subscribe.dto;

import java.time.LocalDateTime;

import org.spring.backend.common.PaymentType;
import org.spring.backend.common.SubscribeStatus;
import org.spring.backend.common.SubscribeType;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class SubscribeDto { // yein 작성

  private Long id; // 아이디 (PK)

  @Enumerated(EnumType.STRING)
  private SubscribeType subscribeType; // 구독 타입 (가격, 구독일수)

  private int price; // 구독권 가격 -> subscribeType.getPrice

  @Enumerated(EnumType.STRING)
  private SubscribeStatus subscribeStatus; // 구독 상태

  private LocalDateTime paidTime; // 결제 시간 -> PaymentStatus.FINISH

  private LocalDateTime subscribeStartTime; // 구독 시작 시간 -> 결제 시간

  private LocalDateTime subscribeExpireTime; // 구독 만료 시간 -> plusDays(subscribeType.getDays)

  private Long paymentId; // 결제 아이디

  private String orderNumber; // 연결된 결제 주문번호

  private PaymentType paymentType; // 결제 방법

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
