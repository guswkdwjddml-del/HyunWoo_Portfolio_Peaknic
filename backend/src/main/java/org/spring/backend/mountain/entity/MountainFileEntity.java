package org.spring.backend.mountain.entity;

import org.spring.backend.common.BasicTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "mountain_file_tb")
public class MountainFileEntity extends BasicTime {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "mountain_file_id")
  private Long id; // 아이디 (PK)

  private String newFileName; // 새 파일 이름 -> DB 저장

  private String oldFileName; // 원본 파일 이름

  // 1:1 (Mountain) -> 산 이미지(1건만)
  @OneToOne
  @JoinColumn(name = "mountain_id", unique = true)
  private MountainEntity mountainEntity;

  @Column(nullable = false)
  private String filePath; // 파일 불러올 경로
}