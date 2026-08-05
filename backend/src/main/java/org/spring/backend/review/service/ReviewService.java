package org.spring.backend.review.service;

import java.io.IOException;
import java.util.List;

import org.spring.backend.board.dto.BoardDto;
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.review.dto.ReviewWriteDto;

public interface ReviewService {

  //리뷰 작성 가능한 회원 조회
  MemberDto reviewMemberInfo();
  //리뷰 등록
  void reviewWrite(BoardDto boardDto,ReviewWriteDto reviewWriteDto) throws IOException;
  //리뷰 리스트 조회
  List<ReviewWriteDto> reviewWriteMountainList();

  

  
}
