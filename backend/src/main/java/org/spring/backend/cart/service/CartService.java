package org.spring.backend.cart.service;

import java.util.List;

import org.spring.backend.cart.dto.CartInsertDto;
import org.spring.backend.cart.dto.CartItemDto;

public interface CartService { // yein 작성

  // 회원 장바구니 담기
  void cartInsert(CartInsertDto cartInsertDto);

  // 비회원 장바구니 담기
  void guestCartInsert(CartInsertDto cartInsertDto);

  // 회원 장바구니 목록 출력
  List<CartItemDto> cartItemList();

  // 비회원 장바구니 목록 출력
  List<CartItemDto> guestCartItemList(String guestId);

  // 장바구니 병합 -> 로그인 전에 비회원 상태로 담은 장바구니(Redis) 있으면 회원 CartDB와 merge
  void cartMerge(String guestId);

  // 회원 장바구니 아이템 삭제
  void cartItemDelete(List<Long> selectIds);

  // 비회원 장바구니 아이템 삭제
  void guestCartItemDelete(String guestId, List<Long> selectIds);

}