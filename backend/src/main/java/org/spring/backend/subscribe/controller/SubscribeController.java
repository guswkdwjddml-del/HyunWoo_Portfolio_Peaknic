package org.spring.backend.subscribe.controller;

import java.util.HashMap;
import java.util.Map;

import org.spring.backend.common.PaymentStatus;
import org.spring.backend.subscribe.dto.SubscribeInsertDto;
import org.spring.backend.subscribe.service.SubscribeService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/subscribe")
@RequiredArgsConstructor
public class SubscribeController { // yein 작성 -> 구독권 결제 전용

  private final SubscribeService subscribeService;

  // 결제하기
  @PostMapping("/insert")
  public ResponseEntity<?> subscribeInsert(@RequestBody SubscribeInsertDto subscribeInsertDto) {
    // 일반 결제: null / 카카오페이: 결제창 URL
    String redirectUrl = subscribeService.subscribeInsert(subscribeInsertDto);

    // 카카오페이 결제시 리다이렉트 주소로 이동
    if (redirectUrl != null) {
      return ResponseEntity.ok(Map.of("redirectUrl", redirectUrl));
    }

    // 일반 결제시 메시지만 전달
    return ResponseEntity.ok(Map.of("message", "구독권 결제 완료"));
  }

  // 결제 승인 -> 프론트가 approval_url로 리다이렉트된 후, pg_token을 담아 이 API를 호출
  @PostMapping("/approval/{orderNumber}")
  public ResponseEntity<?> approve(@PathVariable("orderNumber") String orderNumber,
      @RequestParam("pg_token") String pgToken) {
    subscribeService.subscribeKakaoApprove(orderNumber, pgToken);
    return ResponseEntity.ok(Map.of("message", "카카오페이 구독 결제 승인 완료"));
  }

  // 결제 취소
  @PostMapping("/cancel/{orderNumber}")
  public ResponseEntity<?> cancel(@PathVariable("orderNumber") String orderNumber) {
    subscribeService.subscribeKakaoCancelFail(orderNumber, PaymentStatus.CANCELLED);
    return ResponseEntity.ok(Map.of("message", "카카오페이 구독 결제 취소"));
  }

  // 결제 실패
  @PostMapping("/fail/{orderNumber}")
  public ResponseEntity<?> fail(@PathVariable("orderNumber") String orderNumber) {
    subscribeService.subscribeKakaoCancelFail(orderNumber, PaymentStatus.FAILED);
    return ResponseEntity.ok(Map.of("message", "카카오페이 구독 결제 실패"));
  }

  // 구독 내역 출력 (구독 현황)
  @GetMapping("/detail")
  public ResponseEntity<?> subscribeDetail() {
    Map<String, Object> response = new HashMap<>();
    response.put("result", subscribeService.subscribeDetail());
    return ResponseEntity.ok(response);
  }

  // 구독 결제 내역 출력
  @GetMapping("/list")
  public ResponseEntity<?> subscribeList(@PageableDefault(page = 0, size = 5) Pageable pageable) {
    return ResponseEntity.ok(Map.of("result", subscribeService.subscribeList(pageable)));
  }

}
