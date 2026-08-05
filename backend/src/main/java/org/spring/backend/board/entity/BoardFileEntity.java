package org.spring.backend.board.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.backend.common.BasicTime;
// import org.spring.backend.member.entity.MemberEntity;
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "board_file_tb")
public class BoardFileEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_file_id")
    private Long id;                        // 아이디 (PK)

    private String newFileName;             // 새 파일 이름 -> DB 저장

    private String oldFileName;             // 원본 파일 이름

    // N:1 (Board) -> 게시판에 파일 추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private BoardEntity boardEntity;

}
