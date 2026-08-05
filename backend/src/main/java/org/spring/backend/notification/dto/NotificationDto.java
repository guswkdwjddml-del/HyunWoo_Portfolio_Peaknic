package org.spring.backend.notification.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.common.NotificationType;
import org.spring.backend.common.Role;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
  private Long id;
  private Long memberId; // 알림받는 회원ID
  private Long adminId; // 발송한 관리자ID
  private NotificationType notificationType; // Enum - 각자 필요한 enum 타입 설정해서 이용해주세요.
  private String title; // 알림 제목
  private String message; // 알림 내용
  private String relatedUrl; // 클릭 시 이동할 URL (예: /crew/detail/1)
  private String searchType; // 검색타입 "ALL" , "ADMIN_NOTICE", "SYSTEM(편의메서드활용 알림발송)"
  private Boolean isRead; // 읽음 여부 처리
  private Boolean isDeleted; // 삭제(상태) 여부 , crew처럼 진짜 지워지는게 아니고 프론트에서 보여주냐 차이
  private Role role; // 권한별 발송 및 조히
  private LocalDateTime createTime; // 알림 보낸 시간
  private List<String> imageUrl; // 첨부 파일

  // 검색용 필드
  private String keyword;       // 검색어
  private String searchField;   // 검색 기준 (title, message, memberId, email, name)
  private String userName;
  private String userEmail;
  private LocalDate startDate; // 프론트 검색 조건
  private LocalDate endDate;   // 프론트 검색 조건
}
