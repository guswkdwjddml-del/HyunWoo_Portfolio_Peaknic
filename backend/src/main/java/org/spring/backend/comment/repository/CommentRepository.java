package org.spring.backend.comment.repository;

import java.util.List;

import org.spring.backend.comment.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository <CommentEntity,Long> {
  
  //각 카테고리 게시물별 댓글 목록 조회(최신순)
  List<CommentEntity>findByBoardEntityIdOrderByCreateTimeAsc(Long boardId);
  
  // 게시글별 댓글 수 조회
  int countByBoardEntityId(Long boardId);


  
}
