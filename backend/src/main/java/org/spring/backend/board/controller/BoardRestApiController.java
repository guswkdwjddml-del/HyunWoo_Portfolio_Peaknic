package org.spring.backend.board.controller;


import java.io.IOException;
import java.util.List;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.dto.BoardLikeDto;
import org.spring.backend.board.service.BoardService;
import org.spring.backend.common.BoardCategory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.transaction.Transactional;


@RestController
@RequestMapping("/api/board") //공통 페이지: board
@RequiredArgsConstructor

public class BoardRestApiController {
  private final BoardService boardService;


  //카테고리별 조회가 가능하기 때문에 카테고리 값을 받을 메서드가 필요
    // 목록 (카테고리 필터)
 @GetMapping
    public Page<BoardDto> list(
             @RequestParam(value = "category", required = false) BoardCategory category,
             @RequestParam(value = "memberId", required = false) Long memberId,
        Pageable pageable,
        @RequestParam(value = "subject", required = false) String subject,
        @RequestParam(value = "search", required = false) String search

            
    ) {
        return boardService.boardList(category, memberId, pageable, subject, search);
    }

  //컨트롤러가 부르는 메서드 이름 = 서비스 메서드 이름 
  
  //게시글 등록((Post)-> 사용자가 입력한 데이터 값 필요 (화면에 가지고 와야함)
  //@ModelAttribute -> form(파일)
  @PostMapping("/save")
  public void boardSave(@ModelAttribute BoardDto boardDto) throws IOException {

    System.out.println("title = " + boardDto.getTitle());
    System.out.println("content = " + boardDto.getContent());
    System.out.println("category = " + boardDto.getCategory());
    System.out.println("writer = " + boardDto.getWriter());

      boardService.boardsave(boardDto);
  }



//게시글 목록 조회(상세)-> 조회하고자하는 특정 id 데이터 필요-> 반환: 특정값의 아이디만
//컨트롤러가 부르는 메서드 이름 = 서비스 메서드 이름
@Transactional //save
@GetMapping("/{id}")
public BoardDto boardDetail(@PathVariable("id") Long id) {

    // 조회수 증가
    boardService.boardHit(id);

    // 상세 조회
    return boardService.boardDetail(id);

}

//게시글 수정(PUT)-> 수정한 특정 id 데이터 필요
//@ModelAttribute -> form(파일)
@PutMapping(value="/{id}",consumes="multipart/form-data")
public void boardUpdate(@PathVariable("id") Long id,@ModelAttribute BoardDto boardDto) throws IOException {
    boardDto.setId(id);
    boardService.boardUpdate(boardDto);
}

//게시글 삭제(Delete)-> 삭제한 특정 id 데이터 필요
@DeleteMapping("/{id}")
public void boardDelete(@PathVariable("id") Long id) {
    boardService.boardDelete(id);
}

//좋아요 기능

@PostMapping("/{boardId}/like")
public int boardLike(
        @PathVariable("boardId") Long boardId) {

    return boardService.addlikeboard(boardId);
}

// 좋아요 목록 조회 
@GetMapping("/{boardId}/like")
public List<BoardLikeDto> likeMemberList(
        @PathVariable("boardId") Long boardId){
    return boardService.likeMemberList(boardId);

}

}