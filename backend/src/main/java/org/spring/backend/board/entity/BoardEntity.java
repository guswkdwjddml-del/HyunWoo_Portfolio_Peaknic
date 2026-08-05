package org.spring.backend.board.entity;

import jakarta.persistence.*;
import lombok.*;

import org.spring.backend.comment.entity.CommentEntity;
import org.spring.backend.common.BasicTime;
import org.spring.backend.common.BoardCategory;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.mountain.entity.MountainEntity;

import java.util.ArrayList;
import java.util.List;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "board_tb")
public class BoardEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_id")
    private Long id;                        // 아이디 (PK)

    @Enumerated(EnumType.STRING)
    private BoardCategory boardCategory;    // 게시글 카테고리 (NOTICE, FREE, QNA, FAQ, REVIEW) 공지,자유,QNA, FAQ

    private String title;                   // 게시글 제목

    @Column(columnDefinition = "TEXT")
    private String content;                 // 게시글 내용

    private int viewCount;                  // 조회수

    private int likeCount;                  // 좋아요 개수 (BoardLikeEntity와 연동)

    private boolean attachFile;             // 게시글 사진 여부 (0, 1)




    // N:1 (Member) -> 게시글 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity memberEntity;

    // N:1 (Mountain) -> REVIEW 작성시 사용자가 간 산 참고 -> 다른 카테고리는 null
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mountain_id")
    private MountainEntity mountainEntity;

    // 1:N (BoardLike) -> 좋아요를 누른 게시글 (누가 눌렀는지 확인할 때 사용)
    @Builder.Default    // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "boardEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<BoardLikeEntity> boardLikeEntities = new ArrayList<>();

    // 1:N (BoardFile) -> 게시글에 들어간 사진 / DB CRUD시 파일도 같이 연동됨
    @Builder.Default    // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "boardEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardFileEntity> boardFileEntities = new ArrayList<>();

    // 1:N (Comment) -> 게시글에 달린 댓글
    @Builder.Default    // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "boardEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CommentEntity> commentEntities = new ArrayList<>();

    //1:1 (crewId)-> 리뷰 게시판 작성시 크루 정보 & 크루명 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id")
    private CrewEntity crewEntity;

    

}
