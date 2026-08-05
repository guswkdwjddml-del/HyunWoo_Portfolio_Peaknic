package org.spring.backend.crew.entity;

import jakarta.persistence.*;
import lombok.*;
import org.spring.backend.common.BasicTime;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "crew_file_tb")
public class CrewFileEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crew_file_id")
    private Long id;                        // 아이디 (PK)

    private String newFileName;             // 새 파일 이름 -> DB 저장

    private String oldFileName;             // 원본 파일 이름

    // N:1 (Crew) -> 크루 사진
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id")
    private CrewEntity crewEntity;

    @Column(nullable = false)
    private String filePath;            // 파일 불러올 경로 (기존 서비스에 있던거)

}
