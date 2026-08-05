package org.spring.backend.board.repository;

import java.util.List;

import org.spring.backend.admin.dto.NoticeWidgetDto;
import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.common.BoardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BoardRepository extends JpaRepository<BoardEntity, Long> {

  // ============ 관리자페이지 모임관리용(추가_sun) ==============//
  // 카테고리 및 검색어로 게시글 목록 조회
  Page<BoardEntity> findByBoardCategory(BoardCategory category, Pageable pageable);
  Page<BoardEntity> findByBoardCategoryAndTitleContaining(BoardCategory category, String search, Pageable pageable);
  Page<BoardEntity> findByBoardCategoryAndContentContaining(BoardCategory category, String search, Pageable pageable);
    Page<BoardEntity> findByBoardCategoryAndMemberEntityIdAndContentContaining(BoardCategory category, Long memberId,
      String content, Pageable pageable);
//===================리뷰페이지 검색 조회==========================
  Page<BoardEntity> findByBoardCategoryAndMountainEntity_MountainNameContaining(BoardCategory category, String search,
        Pageable pageable);
  Page<BoardEntity> findByBoardCategoryAndMemberEntity_UserNameContaining(BoardCategory category, String search,
      Pageable pageable);
  
  // Dashboard 출력용
  @Query("""
          select new org.spring.backend.admin.dto.NoticeWidgetDto(
              b.id,
              b.title,
              b.content,
              b.createTime
          )
          from BoardEntity b
          where b.boardCategory = 'NOTICE'
          order by b.createTime desc
      """)
  List<NoticeWidgetDto> findRecentNotice(Pageable pageable);

  // =========================================================//
  

  // 산 상세정보에서 댓글조회 (mountainId,boardCategory REVIEW인 값만 - gyu)
  List<BoardEntity> findByMountainEntity_IdAndBoardCategory(Long mountainId, BoardCategory review);

  // 산 리뷰에 이미 작성한 리뷰가 있으면-> 예외
    boolean existsByMemberEntityIdAndMountainEntityIdAndBoardCategory(
        Long memberId,
        Long mountainId,
        BoardCategory boardCategory        
    );


  // [추가] 특정 멤버가 작성한 전체 게시글 조회 (카테고리 구분 없이 마이페이지 전체용)
  Page<BoardEntity> findByMemberEntityId(Long memberId, Pageable pageable);

  Page<BoardEntity> findByMemberEntityIdAndTitleContaining(Long memberId, String title, Pageable pageable);

  Page<BoardEntity> findByMemberEntityIdAndContentContaining(Long memberId, String content, Pageable pageable);

  // [추가] 특정 멤버가 작성한 게시글 중 특정 카테고리만 필터링 (질문하신 '내가 쓴 자유게시판' 등)
  Page<BoardEntity> findByBoardCategoryAndMemberEntityId(BoardCategory category, Long memberId, Pageable pageable);

  Page<BoardEntity> findByBoardCategoryAndMemberEntityIdAndTitleContaining(BoardCategory category, Long memberId,
      String title, Pageable pageable);



}
