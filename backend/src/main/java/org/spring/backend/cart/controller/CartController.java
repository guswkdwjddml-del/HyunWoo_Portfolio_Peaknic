package org.spring.backend.cart.controller;

import java.util.List;
import java.util.Map;

import org.spring.backend.cart.dto.CartInsertDto;
import org.spring.backend.cart.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController { // yein 작성

  private final CartService cartService;

  // 회원 장바구니 담기
  @PostMapping("/insert")
  public ResponseEntity<?> cartInsert(@RequestBody CartInsertDto cartInsertDto) {
    cartService.cartInsert(cartInsertDto);
    return ResponseEntity.ok(Map.of("message", "회원 장바구니 담기 완료"));
  }

  // 비회원 장바구니 담기
  @PostMapping("/guest/insert")
  public ResponseEntity<?> guestCartInsert(@RequestBody CartInsertDto cartInsertDto) {
    cartService.guestCartInsert(cartInsertDto);
    return ResponseEntity.ok(Map.of("message", "비회원 장바구니 담기 완료"));
  }

  // 회원 장바구니 목록 출력
  @GetMapping("/list")
  public ResponseEntity<?> cartList() {
    return ResponseEntity.ok(Map.of("result", cartService.cartItemList()));
  }

  // 비회원 장바구니 목록 출력
  @GetMapping("/guest/list/{guestId}")
  public ResponseEntity<?> guestCartList(@PathVariable("guestId") String guestId) {
    return ResponseEntity.ok(Map.of("result", cartService.guestCartItemList(guestId)));
  }

  // 장바구니 병합 -> 로그인 전에 비회원 상태로 담은 장바구니(Redis) 있으면 회원 CartDB와 merge
  @PostMapping("/merge/{guestId}")
  public ResponseEntity<?> cartMerge(@PathVariable("guestId") String guestId) {
    cartService.cartMerge(guestId);
    return ResponseEntity.ok(Map.of("message", "장바구니 병합 완료"));
  }

  // 회원 장바구니 아이템 삭제
  @DeleteMapping("/delete/item")
  public ResponseEntity<?> cartItemDelete(@RequestBody List<Long> selectIds) {
    cartService.cartItemDelete(selectIds);
    return ResponseEntity.ok(Map.of("message", "회원 장바구니 아이템 삭제 완료"));
  }

  // 비회원 장바구니 아이템 삭제
  @DeleteMapping("/delete/item/{guestId}")
  public ResponseEntity<?> guestCartItemDelete(@PathVariable("guestId") String guestId,
      @RequestBody List<Long> selectIds) {
    cartService.guestCartItemDelete(guestId, selectIds);
    return ResponseEntity.ok(Map.of("message", "비회원 장바구니 아이템 삭제 완료"));
  }

}
