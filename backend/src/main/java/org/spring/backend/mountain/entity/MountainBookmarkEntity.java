package org.spring.backend.mountain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.backend.common.BasicTime;
import org.spring.backend.member.entity.MemberEntity;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "mountain_bookmark_tb")
public class MountainBookmarkEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mountain_bookmark_id")
    private Long id;                        // 아이디 (PK)

    // N:1 (Member) -> 산 즐겨찾기를 누른 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity memberEntity;

    // N:1 (Mountain) -> 즐겨찾기를 누른 산 게시글
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mountain_id")
    private MountainEntity mountainEntity;

    private int bookmarkCount;


}
