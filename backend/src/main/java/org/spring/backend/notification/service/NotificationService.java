package org.spring.backend.notification.service;

import java.io.IOException;
import java.util.List;

import org.spring.backend.common.NotificationType;
import org.spring.backend.common.Role;
import org.spring.backend.notification.dto.NotificationDto;
import org.spring.backend.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface NotificationService {

  // 1. 알림 전송
  NotificationEntity send(Long memberId, NotificationType type, String title, String message, String relatedUrl);

  // 2. 알림 조회 (필터링)
  Page<NotificationDto> notificationList(NotificationDto notificationDto, Pageable pageable);

  // 3. 관리자 직접 알림 발송 (권한 및 대상자 지정)
  void sendAdminNotice(Long adminId, String targetType, List<Long> memberIds, Role role, String title, String message,
      String relatedUrl,
      List<MultipartFile> files) throws IOException;

  // 4. 관리자 알림 발송 내역 조회
  Page<NotificationDto> adminNotificationList(NotificationDto searchDto, Pageable pageable);
  
  // 읽음 처리
  void read(Long notificationId);

  // 전체 읽음 처리
  void readAll(Long memberId);

  // 안읽은 알림갯수
  long unreadCount(Long memberId);

  // 삭제
  void delete(Long notificationId);

  // 전체 삭제
  public void deleteAll(Long memberId);


  // ===== 편의 메서드 =====

  NotificationEntity sendCrew(Long memberId, String message, String relatedUrl);

  NotificationEntity sendPayment(Long memberId, String message, String relatedUrl);

  NotificationEntity sendBoard(Long memberId, String message, String relatedUrl);

  NotificationEntity sendMountain(Long memberId, String message, String relatedUrl);

  NotificationEntity sendWeather(Long memberId, String message, String relatedUrl);

  NotificationEntity sendCart(Long memberId, String message, String relatedUrl);

  NotificationEntity sendAdmin(Long memberId, String message, String relatedUrl);

  NotificationEntity sendMember(Long memberId, String message, String relatedUrl);

  NotificationEntity sendReview(Long memberId, String message, String relatedUrl);

  NotificationEntity sendNotice(Long memberId, String message, String relatedUrl);

  NotificationEntity sendComment(Long memberId, String message, String relatedUrl);

}
