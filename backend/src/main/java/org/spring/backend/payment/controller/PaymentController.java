package org.spring.backend.payment.controller;

import java.util.List;
import java.util.Map;

import org.spring.backend.common.PaymentStatus;
import org.spring.backend.payment.dto.PaymentInsertDto;
import org.spring.backend.payment.service.PaymentService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController { // yein 작성 -> 크루 결제 전용

  private final PaymentService paymentService;

  // 결제하기
  @PostMapping("/insert")
  public ResponseEntity<?> paymentInsert(@RequestBody PaymentInsertDto paymentInsertDto) {
    // 일반 결제: null / 카카오페이: 결제창 URL
    String redirectUrl = paymentService.paymentInsert(paymentInsertDto);

    // 카카오페이 결제시 리다이렉트 주소로 이동
    if (redirectUrl != null) {
      return ResponseEntity.ok(Map.of("redirectUrl", redirectUrl));
    }

    // 일반 결제시 메시지만 전달
    return ResponseEntity.ok(Map.of("message", "크루 결제 완료"));
  }

  // 결제 승인 -> 프론트가 approval_url로 리다이렉트된 후, pg_token을 담아 이 API를 호출
  @PostMapping("/approval/{orderNumber}")
  public ResponseEntity<?> approve(@PathVariable("orderNumber") String orderNumber,
      @RequestParam("pg_token") String pgToken) {
    List<Long> cartItemIds = paymentService.paymentKakaoApprove(orderNumber, pgToken);
    return ResponseEntity.ok(Map.of("cartItemIds", cartItemIds));
  }

  // 결제 취소
  @PostMapping("/cancel/{orderNumber}")
  public ResponseEntity<?> cancel(@PathVariable("orderNumber") String orderNumber) {
    paymentService.paymentKakaoCancelFail(orderNumber, PaymentStatus.CANCELLED);
    return ResponseEntity.ok(Map.of("message", "카카오페이 크루 결제 취소"));
  }

  // 결제 실패
  @PostMapping("/fail/{orderNumber}")
  public ResponseEntity<?> fail(@PathVariable("orderNumber") String orderNumber) {
    paymentService.paymentKakaoCancelFail(orderNumber, PaymentStatus.FAILED);
    return ResponseEntity.ok(Map.of("message", "카카오페이 크루 결제 실패"));
  }

  // 결제 내역 출력
  @GetMapping("/list")
  public ResponseEntity<?> paymentList(@PageableDefault(page = 0, size = 5) Pageable pageable) {
    return ResponseEntity.ok(Map.of("result", paymentService.paymentList(pageable)));
  }

  // 결제 상세 내역 출력
  @GetMapping("/detail/{orderNumber}")
  public ResponseEntity<?> paymentDetail(@PathVariable("orderNumber") String orderNumber) {
    return ResponseEntity.ok(Map.of("result", paymentService.paymentDetail(orderNumber)));
  }

  // 참여 확정
  @PostMapping("/confirm/{paymentItemId}")
  public ResponseEntity<?> paymentConfirm(@PathVariable("paymentItemId") Long paymentItemId) {
    paymentService.confirmParticipation(paymentItemId);
    return ResponseEntity.ok(Map.of(
        "paymentItemId", paymentItemId,
        "message", "참여 확정 완료"));
  }

  // 결제 내역 삭제 (숨기기)
  @DeleteMapping("/hidden/{paymentId}")
  public ResponseEntity<?> paymentHidden(@PathVariable("paymentId") Long paymentId) {
    paymentService.paymentHidden(paymentId);
    return ResponseEntity.ok(Map.of(
        "paymentId", paymentId,
        "message", "결제 내역 삭제 완료"));
  }

}
