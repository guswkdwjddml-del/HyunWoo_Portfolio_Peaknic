package org.spring.backend.board.dto;

import org.spring.backend.board.entity.BoardLikeEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BoardLikeDto {

  private String userName;
  private Long memberId;   //이름 -> 누구인지 뜨기?

  public static BoardLikeDto toBoardLikeDto(BoardLikeEntity entity){
    BoardLikeDto boardlikedto = new BoardLikeDto();

    boardlikedto.setMemberId(entity.getMemberEntity().getId());
    boardlikedto.setUserName(entity.getMemberEntity().getUserName());
    
    return boardlikedto;
}


 

  
}
