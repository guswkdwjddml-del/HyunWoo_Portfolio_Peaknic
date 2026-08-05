package org.spring.backend.comment.repository;
import java.util.Optional;

import org.spring.backend.comment.entity.CommentEntity;
import org.spring.backend.comment.entity.CommentLikeEntity;
import org.spring.backend.member.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentLikeRepository extends JpaRepository <CommentLikeEntity,Long>  {
  // 해당 회원이 해당 댓글에 좋아요 했는지 확인
    Optional<CommentLikeEntity> findByMemberEntityAndCommentEntity
    (MemberEntity memberEntity,CommentEntity commentEntity);
  
}
