package org.spring.backend.admin.controller;

import org.spring.backend.common.Role;
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.member.service.MemberService;
import org.spring.backend.notification.dto.NotificationDto;
import org.spring.backend.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/notification")
public class AdminNotificationController {

  private final NotificationService notificationService;
  private final MemberService memberService;
  private final MemberRepository memberRepository;

  // 관리자 알림 발송 내역 리스트 조회
  @GetMapping("/list")
  public ResponseEntity<Page<NotificationDto>> adminNotificationList(
      @ModelAttribute NotificationDto searchDto,
      @PageableDefault(size = 10, sort = "createTime", direction = Sort.Direction.DESC) Pageable pageable) {

    Page<NotificationDto> result = notificationService.adminNotificationList(searchDto, pageable);
    return ResponseEntity.ok(result);
  }

  // 관리자가 특정 회원의 수신 알림 내역을 조회
  @GetMapping("/list/{memberId}")
  public ResponseEntity<Page<NotificationDto>> getUserNoticesByAdmin(
      @PathVariable("memberId") Long memberId,
      @ModelAttribute NotificationDto searchDto,
      @PageableDefault(size = 15, sort = "createTime", direction = Sort.Direction.DESC) Pageable pageable) {

    // 검색 DTO에 조회 대상 회원 ID만 덮어씌움
    searchDto.setMemberId(memberId);

    Page<NotificationDto> list = notificationService.notificationList(searchDto, pageable);
    return ResponseEntity.ok(list);
  }

  // 관리자 알림 발송용 특정 회원 검색 API
  @GetMapping("/members/search")
  public ResponseEntity<List<MemberDto>> searchMembersForAdmin(
      @RequestParam(value = "keyword", required = false) String keyword,
      @RequestParam(value = "role", required = false) Role role) {

    List<MemberEntity> members = memberRepository.searchMembersForAdmin(keyword, role);
    List<MemberDto> dtos = members.stream().map(MemberDto::toMemberDto).toList();
    return ResponseEntity.ok(dtos);
  }

  // 관리자 메시지 발송 실행
  @PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> sendAdminNotice(
      @AuthenticationPrincipal String userEmail,
      @RequestParam(value = "targetType") String targetType, // ALL, ROLE, MEMBER
      @RequestParam(value = "memberIds", required = false) List<Long> memberIds,
      @RequestParam(value = "role", required = false) Role role,
      @RequestParam(value = "title") String title,
      @RequestParam(value = "message") String message,
      @RequestParam(value = "relatedUrl", required = false) String relatedUrl,
      @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {

    Long adminId = memberService.detail(userEmail).getId();

    notificationService.sendAdminNotice(adminId, targetType, memberIds, role, title, message, relatedUrl, files);

    return ResponseEntity.ok("알림이 성공적으로 발송되었습니다.");
  }

}