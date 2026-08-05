package org.spring.backend.admin.controller;

import java.util.HashMap;
import java.util.Map;

import org.spring.backend.payment.dto.PaymentDto;
import org.spring.backend.payment.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/payment")
@RequiredArgsConstructor
public class AdminPaymentController {

  private final PaymentService paymentService;

  @GetMapping("")
  public ResponseEntity<?> paymentListAll(
      @PageableDefault(page = 0, size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
      @RequestParam(value = "subject", required = false) String subject,
      @RequestParam(value = "search", required = false) String search,
      @RequestParam(value = "paymentCategory", defaultValue = "ALL") String paymentCategory
    ) {
    Page<PaymentDto> paymentListAll = paymentService.paymentListAll(pageable, subject, search, paymentCategory);

    Map<String, Object> map = new HashMap<>();
    map.put("paymentListAll", paymentListAll);

    return ResponseEntity.ok(map);
  }

  @GetMapping("/detail/{id}")
  public ResponseEntity<?> paymentDetailAdmin(@PathVariable("id") Long id){
    PaymentDto paymentDto = paymentService.paymentDetailAdmin(id);
    
    Map<String, Object> map = new HashMap<>();
    map.put("payment", paymentDto);

    return ResponseEntity.ok(map);
  }

}
