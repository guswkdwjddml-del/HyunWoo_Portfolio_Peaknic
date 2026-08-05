package org.spring.backend.admin.controller;

import org.spring.backend.admin.dto.DashboardDto;
import org.spring.backend.admin.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

  private final DashboardService dashboardService;

  @GetMapping("/dashboard")
  public ResponseEntity<DashboardDto> dashboardData() {
    return ResponseEntity.ok(dashboardService.getDashboard());
  }

}
