package org.spring.backend.notification.entity;

import java.util.List;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.NotificationType;
import org.spring.backend.common.Role;
import org.spring.backend.crew.config.StringListConverter;
import org.spring.backend.member.entity.MemberEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification_tb")
public class NotificationEntity extends BasicTime {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "notification_id")
  private Long id;

  @Enumerated(EnumType.STRING)
  private NotificationType notificationType; // 알림 종류

  private String title; // 알림 제목

  private String message; // 알림 내용

  private String relatedUrl; // 클릭 시 이동할 URL (예: /crew/detail/1)

  private Boolean isRead; // 읽음 여부 처리

  private String searchType;  // 검색타입 "ALL" , "ADMIN_NOTICE", "SYSTEM(편의메서드활용 알림발송)"

  private Boolean isDeleted; // 삭제(상태) 여부 , crew처럼 진짜 지워지는게 아니고 프론트에서 보여주냐 차이

  @Enumerated(EnumType.STRING)
  private Role role;  // 멤버 권한별 발송 및 조회

  private Long adminId; // 발송하는 관리자 ID

  @Convert(converter = StringListConverter.class) // 만들어둔 클래스활용 List 프론트에서 바로활용할수없음
  @Column(length = 1000)
  private List<String> imageUrl; // 첨부 이미지

  // ------------- 연관관계 -------------- //
  // 알림 수신자 (N:1)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "member_id")
  private MemberEntity memberEntity;
  // ----------------------------------- //
}
