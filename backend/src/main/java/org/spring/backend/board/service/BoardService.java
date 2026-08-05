package org.spring.backend.board.service;

import java.io.IOException;
import java.util.List;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.dto.BoardLikeDto;
import org.spring.backend.common.BoardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BoardService {

//게시글 등록
void boardsave(BoardDto boardDto) throws IOException;

//게시글 목록 조회(전체)
List<BoardDto>boardList();

//게시글 상세 목록 조회
BoardDto boardDetail(Long id);

//게시글 수정
void boardUpdate(BoardDto boardDto) throws IOException;

//게시글 삭제
void boardDelete(Long id);

//좋아요 기능 실행
int addlikeboard(Long boardId);

//조회수 증가
int boardHit(Long boardId);

//좋아요 누른 회원 목록 조회
List<BoardLikeDto> likeMemberList(Long boardId);

// ============ 관리자페이지 커뮤니티 관리용(추가_sun) ==============//
Page<BoardDto> boardList(BoardCategory category, Long memberId, Pageable pageable, String subject, String search);
// =============================================================//
}


  
