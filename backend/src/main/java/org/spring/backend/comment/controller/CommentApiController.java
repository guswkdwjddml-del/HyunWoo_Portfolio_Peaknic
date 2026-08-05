package org.spring.backend.comment.controller;

import java.util.List;

import org.spring.backend.comment.dto.CommentDto;
import org.spring.backend.comment.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommentApiController {


    private final CommentService commentService;

//댓글등록
    @PostMapping("/board/{boardId}/comments")
    public ResponseEntity<?> commentSave(

            @PathVariable("boardId") Long boardId,
            @RequestBody CommentDto commentDto

    ){
        commentService.commentSave(
                boardId,
                commentDto
        );
        return ResponseEntity.ok(
                "댓글 등록 완료"
        );
    }

    //댓글 목록 조회
    @GetMapping("/board/{boardId}/comments")
    public ResponseEntity<List<CommentDto>> commentList(
            @PathVariable("boardId") Long boardId
    ){
        return ResponseEntity.ok(
                commentService.commentList(boardId)
        );
    }

    //댓글 수정
    @PutMapping("/comments/{id}")
    public ResponseEntity<?> commentUpdate(

            @PathVariable("id") Long id,
            @RequestBody CommentDto commentDto

    ){
        // URL의 id를 DTO에 ..
        commentDto.setId(id);


        commentService.commentUpdate(
                commentDto
        );
        return ResponseEntity.ok(
                "댓글 수정 완료"
        );
    }

//댓글 삭제
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> commentDelete(

            @PathVariable("id") Long id

    ){
        commentService.commentDelete(id);
        return ResponseEntity.ok(
                "댓글 삭제 완료"
        );
    }

//좋아요 기능 
@PostMapping("/comments/{id}/like")
public ResponseEntity<Integer> commentLike(
        @PathVariable("id") Long id
){
    return ResponseEntity.ok(
            commentService.addLikeComment(id)
    );

}
}