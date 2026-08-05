package org.spring.backend.comment.service;

import java.util.List;

import org.spring.backend.comment.dto.CommentDto;

public interface CommentService {

  //댓글 등록
  void commentSave(Long boardId, CommentDto commentDto);
  //댓글 수정
  void commentUpdate(CommentDto commentDto);
  //댓글 목록 조회
  List<CommentDto> commentList(Long boardId);
  //댓글 삭제
  void commentDelete(Long id);
  //좋아요-> 수정&삭제
  int addLikeComment(Long commentId);


  
}
