package org.spring.backend.comment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.backend.common.BasicTime;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "comment_file_tb")
public class CommentFileEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_file_id")
    private Long id;                        // 아이디 (PK)

    private String newFileName;             // 새 파일 이름 -> DB 저장

    private String oldFileName;             // 원본 파일 이름

    // N:1 (Comment) -> 댓글에 파일 추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private CommentEntity commentEntity;

}
