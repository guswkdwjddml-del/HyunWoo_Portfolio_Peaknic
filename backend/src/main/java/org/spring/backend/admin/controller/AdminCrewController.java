package org.spring.backend.admin.controller;

import java.util.List;
import java.util.Map;

import org.spring.backend.admin.dto.AdminCrewDto;
import org.spring.backend.crew.dto.CrewDto;
import org.spring.backend.crew.service.CrewService;
import org.spring.backend.settlement.service.SettlementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/crew")
@RequiredArgsConstructor
public class AdminCrewController {

    private final CrewService crewService;
    private final SettlementService settlementService;

    // 크루 리스트
    @GetMapping("")
    public ResponseEntity<Page<AdminCrewDto>> crewList(
            @RequestParam(value = "memberId", required = false) Long memberId,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sido", required = false) String sido,
            @RequestParam(value = "sigungu", required = false) String sigungu,
            @RequestParam(value = "mountainName", required = false) String mountainName,
            @RequestParam(value = "crewLevel", required = false) String crewLevel,
            @RequestParam(value = "crewStatus", required = false) String crewStatus,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {

        Page<AdminCrewDto> result = crewService.adminCrewList(memberId, keyword, sido, sigungu, mountainName, crewLevel,
                crewStatus,
                tags,
                pageable);
        return ResponseEntity.ok(result);
    }

    // 크루 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updateCrew(@PathVariable("id") Long id, @RequestBody CrewDto crewDto) {

        crewService.updateCrewAdmin(id, crewDto);
        return ResponseEntity.ok("크루 정보가 성공적으로 수정되었습니다.");
    }

    // 크루 삭제 (진짜 삭제아님, Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCrew(@PathVariable("id") Long id) {

        crewService.deleteCrewAdmin(id);
        return ResponseEntity.ok("크루가 삭제되었습니다.");
    }

    // 크루 정산 상세 조회
    @GetMapping("/settlement/{id}")
    public ResponseEntity<AdminCrewDto> crewSettlementDetail(@PathVariable("id") Long id) {
        AdminCrewDto result = crewService.crewSettlementDetail(id);
        return ResponseEntity.ok(result);
    }

    // 크루 정산 -> 관리자가 크루장에게 입금
    @PostMapping("/settlement/{id}")
    public ResponseEntity<?> settlementComplete(@PathVariable("id") Long settlementId) {
        settlementService.settleComplete(settlementId);
        return ResponseEntity.ok(Map.of("message", "정산 완료"));
    }

}
