package org.spring.backend.notification.controller;

import org.spring.backend.member.service.MemberService;
import org.spring.backend.notification.dto.NotificationDto;
import org.spring.backend.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
public class NotificationController {

  private final NotificationService notificationService;
  private final MemberService memberService;

  // ===================== 알림 조회 ===================== //
  @GetMapping
  public Page<NotificationDto> notificationList(
      @AuthenticationPrincipal String userEmail,
      @ModelAttribute NotificationDto searchDto,
      @PageableDefault(size = 20, sort = "createTime", direction = Sort.Direction.DESC) Pageable pageable) {

    // 로그인회원id
    searchDto.setMemberId(memberService.detail(userEmail).getId());

    // Service단으로 DTO 전달
    return notificationService.notificationList(searchDto, pageable);
  }

  // ===================== 읽음 처리 ===================== //
  @PatchMapping("/{notificationId}/read")
  public void readNotification(@PathVariable("notificationId") Long notificationId) {
    notificationService.read(notificationId);
  }

  // ===================== 전체 읽음 처리 ===================== //
  @PatchMapping("/read-all")
  public void readAll(@AuthenticationPrincipal String userEmail) {
    notificationService.readAll(memberService.detail(userEmail).getId());
  }

  // ===================== 삭제 ===================== //
  @DeleteMapping("/{notificationId}")
  public void deleteNotification(@PathVariable("notificationId") Long notificationId) {
    notificationService.delete(notificationId);
  }

  // ===================== 전체 삭제 ===================== //
  @DeleteMapping
  public void deleteAll(@AuthenticationPrincipal String userEmail) {
    notificationService.deleteAll(memberService.detail(userEmail).getId());
  }

  // ===================== 안읽은 알림 갯수 ===================== //
  @GetMapping("/count")
  public long unreadCount(@AuthenticationPrincipal String userEmail) {
    return notificationService.unreadCount(memberService.detail(userEmail).getId());
  }

}
