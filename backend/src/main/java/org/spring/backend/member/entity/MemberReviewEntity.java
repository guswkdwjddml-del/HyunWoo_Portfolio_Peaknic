package org.spring.backend.member.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.backend.common.BasicTime;

import java.util.ArrayList;
import java.util.List;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "memberReview_tb")

public class MemberReviewEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_review_id")
    private Long id;                    // 아이디 (PK)

    private int memberScore;            // 회원 후기 평점 (1~5)

    private String memberReviewDetail;  // 회원 후기

    private boolean attachFile;         // 멤버 리뷰 사진 여부 (0, 1)

    // N:1 (Member) -> 회원 후기 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_writer_id")
    private MemberEntity memberEntity;

    // N:1 (Member) -> 후기를 받는 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_target_id")
    private MemberEntity target;

    // 1:N (MemberReviewFile) -> 멤버 리뷰 사진 / DB CRUD시 파일도 같이 연동됨
    @Builder.Default    // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberReviewEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MemberReviewFileEntity> memberReviewFileEntities = new ArrayList<>();

}
