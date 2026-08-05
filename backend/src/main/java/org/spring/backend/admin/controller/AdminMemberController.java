package org.spring.backend.admin.controller;

import java.util.HashMap;
import java.util.Map;

import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.service.MemberService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/member")
@RequiredArgsConstructor
public class AdminMemberController {

  private final MemberService memberService;

  @GetMapping("")
  public ResponseEntity<?> memberList(
      @PageableDefault(page = 0, size = 5, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
      @RequestParam(value = "subject", required = false) String subject,
      @RequestParam(value = "search", required = false) String search) {
    Page<MemberDto> memberList = memberService.memberList(pageable, subject, search);

    Map<String, Object> map = new HashMap<>();
    map.put("memberList", memberList);

    return ResponseEntity.ok(map);
  }

  @GetMapping("/detail/{userEmail}")
  public ResponseEntity<?> memberDetail(@PathVariable("userEmail") String userEmail) {

    MemberDto memberDto = memberService.detail(userEmail);

    Map<String, Object> map = new HashMap<>();
    map.put("member", memberDto);

    return ResponseEntity.ok(map);
  }

  @PutMapping("/update/{id}")
  public ResponseEntity<?> memberUpdate(
      @PathVariable("id") Long id,
      @RequestBody MemberDto memberDto) {

    memberService.memberUpdate(id, memberDto);
    return ResponseEntity.ok(Map.of("message", "회원 정보가 성공적으로 수정되었습니다."));
  }

  @DeleteMapping("/delete/{id}")
  public ResponseEntity<?> memberDelete(@PathVariable("id") Long id) {

    memberService.memberDelete(id);
    return ResponseEntity.ok(Map.of("message", "회원 정보가 성공적으로 삭제되었습니다."));
  }

}
