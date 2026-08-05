package org.spring.backend.review.controller;

import java.io.IOException;
import java.util.List;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.dto.BoardLikeDto;
import org.spring.backend.board.service.BoardService;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.review.dto.ReviewWriteDto;
import org.spring.backend.review.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.entity.MemberEntity;

import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewRestApiController {

    private final BoardService boardService;
    private final ReviewService reviewService;
    private final SecurityMemberUtil securityMemberUtil;

    // 회원정보 조회
    @GetMapping("/info")
    public MemberDto memberInfo() {

        MemberEntity member = securityMemberUtil.getLoginMember();

        return MemberDto.toMemberDto(member);

    }

    // 리뷰 목록
    @GetMapping
    public Page<BoardDto> reviewList(
            Pageable pageable,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "search", required = false) String search) {

        return boardService.boardList(
                BoardCategory.REVIEW,
                null,
                pageable,
                subject,
                search);

    }

    // 리뷰 목록
    @GetMapping("/myReview")
    public Page<BoardDto> myReviewList(
            @RequestParam(value = "memberId", required = false) Long memberId,
            Pageable pageable,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "search", required = false) String search) {

        return boardService.boardList(
                BoardCategory.REVIEW,
                memberId,
                pageable,
                subject,
                search);

    }

    // 리뷰 작성 가능한 산 목록 조회
    @GetMapping("/write/mountains")
    public List<ReviewWriteDto> reviewWriteMountainList() {

        return reviewService.reviewWriteMountainList();

    }

    // 리뷰 등록
    @PostMapping(value = "/write", consumes = "multipart/form-data")
    public void reviewWrite(
            @ModelAttribute BoardDto boardDto,
            @ModelAttribute ReviewWriteDto reviewWriteDto) throws IOException {

        reviewService.reviewWrite(
                boardDto,
                reviewWriteDto);

    }

    // 리뷰 상세
    @Transactional
    @GetMapping("/{id}")
    public BoardDto reviewDetail(
            @PathVariable("id") Long id) {

        // 조회수 증가
        boardService.boardHit(id);
        return boardService.boardDetail(id);

    }

    // 리뷰 수정
    @PutMapping(value = "/update/{id}", consumes = "multipart/form-data")
    public void reviewUpdate(
            @PathVariable("id") Long id,
            @ModelAttribute BoardDto boardDto) throws IOException {

        boardDto.setId(id);

        // 리뷰 카테고리 유지
        boardDto.setCategory(BoardCategory.REVIEW);

        boardService.boardUpdate(boardDto);

    }

    // 리뷰 삭제
    @DeleteMapping("/{id}")
    public void reviewDelete(
            @PathVariable("id") Long id) {

        boardService.boardDelete(id);

    }

    // 좋아요
    @PostMapping("/{boardId}/like")
    public int reviewLike(
            @PathVariable("boardId") Long boardId) {

        return boardService.addlikeboard(boardId);

    }

    // 좋아요 회원 조회
    @GetMapping("/{boardId}/like")
    public List<BoardLikeDto> likeMemberList(
            @PathVariable("boardId") Long boardId) {

        return boardService.likeMemberList(boardId);

    }

}
