package org.spring.backend.comment.dto;

import java.time.LocalDateTime;

import org.springframework.web.multipart.MultipartFile;

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
public class CommentDto {

  private Long id;
      
  private String content;  // 댓글 내용

  private int likeCount; //좋아요 개수

  private LocalDateTime createTime;
  
  private LocalDateTime updateTime;
  
  private String memberName; //댓글 작성자
  
  private MultipartFile boardFile; // 실제 파일(이미지)

  private String newFileName;// 새이름 ->DB,로컬저장소 저장이름

  private String oleFileName;// 원본이름
  
  private String memberEmail;

  
}