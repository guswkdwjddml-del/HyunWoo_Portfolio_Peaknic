package org.spring.backend.crew.controller;

import java.util.List;

import org.spring.backend.crew.dto.CrewDto;
import org.spring.backend.crew.service.CrewService;
import org.spring.backend.customcourse.dto.CustomCourseDto;
import org.spring.backend.member.dto.MemberDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crews")
@RequiredArgsConstructor
public class CrewController {

  private final CrewService crewService;

  // 1. 크루 만들기 // 프론트에서 파일받기위해 @RequestBody(json)대신 @ModelAttribute(formdata) 사용
  // ** crewCreate에서 코스경로 담아두기위해 requestPart추가
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Long> createCrew(@ModelAttribute CrewDto crewDto,
      @RequestPart(value = "courseData", required = false) CustomCourseDto courseData,
      @AuthenticationPrincipal String userEmail) {
    if (userEmail == null) {
      return ResponseEntity.status(401).body(null);
    }
    crewDto.setCourseData(courseData);
    Long crewId = crewService.insertCrew(crewDto, userEmail);
    return ResponseEntity.ok(crewId);
  }

  // 2. 크루 목록 조회
  @GetMapping("/search")
  public ResponseEntity<Page<CrewDto>> searchCrewList(
      @RequestParam(value = "memberId",required = false) Long memberId,
      @RequestParam(value = "keyword",required = false) String keyword,
      @RequestParam(value = "sido",required = false) String sido,
      @RequestParam(value = "sigungu",required = false) String sigungu,
      @RequestParam(value = "mountainName",required = false) String mountainName,
      @RequestParam(value = "crewLevel",required = false) String crewLevel,
      @RequestParam(value = "crewStatus", required = false) String crewStatus,      
      @RequestParam(value = "tags",required = false) List<String> tags,
      // 프론트에서 ?page=0&size=10&sort=id,desc 형태로 보내면 Pageable 객체로 자동 변환됩니다!
      @PageableDefault(page = 0, size = 10) Pageable pageable) {

    Page<CrewDto> result = crewService.searchCrews(memberId, keyword, sido, sigungu, mountainName, crewLevel,
        crewStatus, tags,
        pageable);
    return ResponseEntity.ok(result);
  }

  // 3. 크루 상세 조회
  @GetMapping("/{id}")
  public ResponseEntity<CrewDto> getCrewDetail(@PathVariable("id") Long id) {
    CrewDto result = crewService.detailCrew(id);
    return ResponseEntity.ok(result);
  }

  // 4. 크루 수정
  @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> updateCrew(@PathVariable("id") Long id,
      @ModelAttribute CrewDto crewDto,
      @AuthenticationPrincipal String userEmail,
      @RequestPart(value = "courseData", required = false) CustomCourseDto courseData) {
    if (userEmail == null) {
      return ResponseEntity.status(401).body("로그인이 필요합니다.");
    }
    crewDto.setCourseData(courseData);
    // 서비스로 이메일 전달
    crewService.updateCrew(id, crewDto, userEmail);
    return ResponseEntity.ok("크루 정보가 성공적으로 수정되었습니다.");
  }

  // 5. 크루 삭제 (진짜 삭제아님,Soft Delete)
  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteCrew(@PathVariable("id") Long id, @AuthenticationPrincipal String userEmail) {
    if (userEmail == null) {
      return ResponseEntity.status(401).body("로그인이 필요합니다.");
    }

    // 서비스로 이메일 전달
    crewService.deleteCrew(id, userEmail);
    return ResponseEntity.ok("크루가 삭제되었습니다.");
  }

  // 6. 크루 참가 취소 및 환불 요청 처리 (방장/참여자구분, crewStatus/paymentStatus 변경)
  @PostMapping("/{id}/cancel")
  public ResponseEntity<String> cancelCrewParticipation(@PathVariable("id") Long id,
      @AuthenticationPrincipal String userEmail) {
    crewService.cancelCrewParticipation(id, userEmail);
    return ResponseEntity.ok("취소 및 환불 요청이 완료되었습니다.");
  }

  // 7. 크루 참여자 목록조회
  @GetMapping("/{crewId}/participants")
  public ResponseEntity<List<MemberDto>> getCrewParticipants(@PathVariable("crewId") Long crewId) {
    return ResponseEntity.ok(crewService.getCrewParticipants(crewId));
  }

  // 8. 자신이 참여한 크루 목록 조회
  @GetMapping("/myjoincrew")
  public ResponseEntity<Page<CrewDto>> myjoincrew(
      @RequestParam(value = "memberId",required = false) Long memberId,
      @RequestParam(value = "keyword",required = false) String keyword,
      @RequestParam(value = "sido",required = false) String sido,
      @RequestParam(value = "sigungu",required = false) String sigungu,
      @RequestParam(value = "mountainName",required = false) String mountainName,
      @RequestParam(value = "crewLevel",required = false) String crewLevel,
      @RequestParam(value = "crewStatus", required = false) String crewStatus,
      @RequestParam(value = "tags",required = false) List<String> tags,
      // 프론트에서 ?page=0&size=10&sort=id,desc 형태로 보내면 Pageable 객체로 자동 변환됩니다!
      @PageableDefault(page = 0, size = 10) Pageable pageable) {

    Page<CrewDto> result = crewService.myJoinedCrews(memberId, keyword, sido, sigungu, mountainName, crewLevel,
        crewStatus, tags,
        pageable);
    return ResponseEntity.ok(result);
  }

}
