package org.spring.backend.mountain.service;

import java.util.List;
import org.spring.backend.board.dto.BoardDto;

public interface MountainReviewService {
  // board, boardCategory에서 REVIEW 값만 조회
  public List<BoardDto> mountainReview(Long mountainId);
}
