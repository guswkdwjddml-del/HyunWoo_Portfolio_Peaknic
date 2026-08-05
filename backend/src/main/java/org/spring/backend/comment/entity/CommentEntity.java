package org.spring.backend.comment.entity;

import jakarta.persistence.*;
import lombok.*;

import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.common.BasicTime;
import org.spring.backend.member.entity.MemberEntity;

import java.util.ArrayList;
import java.util.List;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "comment_tb")
public class CommentEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;                        // 아이디 (PK)

    private String content;                 // 댓글 내용

    private int likeCount;                  // 댓글 좋아요 개수

    // N:1 (Member) -> 댓글 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity memberEntity;

    // N:1 (Board) -> 댓글이 달린 게시물
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private BoardEntity boardEntity;

    // N:1 (Comment) -> 대댓글 기능, 부모(원 댓글) 정보 저장용
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_parent_id")
    private CommentEntity commentEntity;

    // 1:N (CommentFile) -> 댓글에 추가된 파일 / DB CRUD시 파일도 같이 연동됨
    @Builder.Default    // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "commentEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommentFileEntity> commentFileEntities = new ArrayList<>();

    // 1:N (CommentLike) -> 좋아요를 누른 댓글 (누가 눌렀는지 확인할 때 사용)
    @Builder.Default    // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "commentEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CommentLikeEntity> commentLikeEntities = new ArrayList<>();

}
