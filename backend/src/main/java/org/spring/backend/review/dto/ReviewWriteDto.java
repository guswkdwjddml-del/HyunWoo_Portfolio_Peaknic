package org.spring.backend.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReviewWriteDto {
   
  
    private Long memberId; //회원 Id
    
    private String userName; // 회원 이름
    
    private String crewName; // 크루 이름

    private Long crewId; // 크루 아이디-> 필요하면 사용

    private Long mountainId; // 산 Id-> 리뷰 가능한 산인지 조회 시 필요
    
    private String mountainName; //산 이름

    private Long paymentItemId;  // 리뷰 작성 완료 처리용

  
}
