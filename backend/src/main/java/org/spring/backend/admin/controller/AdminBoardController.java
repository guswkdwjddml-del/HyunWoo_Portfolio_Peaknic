package org.spring.backend.admin.controller;

import java.util.HashMap;
import java.util.Map;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.service.BoardService;
import org.spring.backend.common.BoardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/board")
@RequiredArgsConstructor
public class AdminBoardController {

  private final BoardService boardService;

  @GetMapping("")
  public ResponseEntity<?> boardList(@RequestParam("category") BoardCategory category,
    @PageableDefault(page = 0, size = 5, sort = "id",
                                     direction = Sort.Direction.DESC) Pageable pageable,
                             @RequestParam(value = "subject", required = false) String subject,
                             @RequestParam(value = "search", required = false) String search
  ) {
    Long memberId = null;
    Page<BoardDto> boardList = boardService.boardList(category, memberId, pageable, subject, search);

    Map<String, Object> map = new HashMap<>();
    map.put("boardList", boardList);

    return ResponseEntity.ok(map);
  }

}
