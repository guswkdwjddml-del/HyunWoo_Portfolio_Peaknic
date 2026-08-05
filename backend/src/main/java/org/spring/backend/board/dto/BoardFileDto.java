package org.spring.backend.board.dto;

import java.time.LocalDateTime;

import org.spring.backend.board.entity.BoardEntity;

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
public class BoardFileDto {
   private Long id;

    private String newFileName;// 새이름 ->DB,로컬저장소 저장이름

    private String oleFileName;// 원본이름

    private Long boardId; // board_id

    private BoardEntity boardEntity;//board.getMemberEntity().id

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

   



}
