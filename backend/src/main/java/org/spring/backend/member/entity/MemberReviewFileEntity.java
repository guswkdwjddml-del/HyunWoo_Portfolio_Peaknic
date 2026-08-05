package org.spring.backend.member.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.backend.common.BasicTime;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "member_review_file_tb")
public class MemberReviewFileEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_review_file_id")
    private Long id;                        // 아이디 (PK)

    private String newFileName;             // 새 파일 이름 -> DB 저장

    
    private String oldFileName;             // 원본 파일 이름

    // N:1 (MemberReview) -> 회원 리뷰 사진
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_review_id")
    private MemberReviewEntity memberReviewEntity;

}
