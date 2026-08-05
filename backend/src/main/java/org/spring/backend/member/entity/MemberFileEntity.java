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
@Table(name = "member_file_tb")
public class MemberFileEntity extends BasicTime {
    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_file_id")
    private Long id;                        // 아이디 (PK)

    private String newFileName; // DB 및 서버 저장용 파일명

    private String oldFileName; // 사용자가 업로드한 원본 파일명

    // 🌟 1:1 매핑을 위해 @ManyToOne 대신 @OneToOne 사용 및 UNIQUE 제약 조건 추가
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", unique = true)
    private MemberEntity memberEntity;

}
