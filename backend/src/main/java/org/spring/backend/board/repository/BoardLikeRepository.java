package org.spring.backend.board.repository;
import java.util.List;
import java.util.Optional;

import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.board.entity.BoardLikeEntity;
import org.spring.backend.member.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardLikeRepository extends JpaRepository <BoardLikeEntity, Long> {
  
//로그인 한 회원이 이전에 누른 좋아요가 있는지 확인-> 중복 방지
  Optional<BoardLikeEntity> findByMemberEntityAndBoardEntity
  (MemberEntity loginMember, BoardEntity boardEntity); 
//좋아요 누른 회원 조회
  List<BoardLikeEntity> findAllByBoardEntity
  (BoardEntity boardEntity);



  
}
