package org.spring.backend.admin.controller;

import java.util.Map;

import org.spring.backend.settlement.service.SettlementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/settlement")
@RequiredArgsConstructor
public class AdminSettlementController { // yein 작성

  private final SettlementService settlementService;

  // 정산 완료 -> 관리자가 크루장에게 입금
  @PostMapping("/complete/{settlementId}")
  public ResponseEntity<?> settlementComplete(@PathVariable("settlementId") Long settlementId) {
    settlementService.settleComplete(settlementId);
    return ResponseEntity.ok(Map.of("message", "정산 완료"));
  }

}
