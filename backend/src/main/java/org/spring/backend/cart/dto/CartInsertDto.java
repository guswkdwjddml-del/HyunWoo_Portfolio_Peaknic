package org.spring.backend.cart.dto;

import java.time.LocalDateTime;

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
public class CartInsertDto { // yein 작성

  private String guestId; // 비회원 아이디

  private Long crewId; // 장바구니에 담을 크루 아이디

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
