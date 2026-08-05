package org.spring.backend.mountain.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.board.repository.BoardRepository;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.mountain.service.MountainReviewService;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
// board에서 땡겨와서 boardCategory REVIEW인것만 조회
public class MountainReviewServiceImpl implements MountainReviewService {

  private final BoardRepository boardRepository;

  @Override
  public List<BoardDto> mountainReview(Long mountainId) {

    // 산 ID가 일치하고 카테고리가 'REVIEW'인 게시글을 DB에서 가져옴
    List<BoardEntity> reviews = boardRepository.findByMountainEntity_IdAndBoardCategory(mountainId, BoardCategory.REVIEW);

    // boardDto안 메서드 활용
    return reviews.stream()
            .map(BoardDto::toBoardDto)
            .collect(Collectors.toList());
  }
}
