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
public class CartDto { // yein 작성

  private Long id; // 장바구니 아이디

  private Long memberId; // 장바구니 주인 (회원)

  private LocalDateTime createTime;
  private LocalDateTime updateTime;

}
