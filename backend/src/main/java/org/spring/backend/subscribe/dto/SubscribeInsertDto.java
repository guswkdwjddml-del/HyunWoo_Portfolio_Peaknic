package org.spring.backend.subscribe.dto;

import java.time.LocalDateTime;

import org.spring.backend.common.PaymentType;
import org.spring.backend.common.SubscribeType;

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
public class SubscribeInsertDto { // yein 작성

  private SubscribeType subscribeType; // 구독 타입

  private PaymentType paymentType; // 결제 방법

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
