package org.spring.backend.notification.repository;

import org.spring.backend.notification.dto.NotificationDto;
import org.spring.backend.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationRepositoryCustom {
  // 1. 사용자 마이페이지 알림 조회용
  Page<NotificationEntity> searchMyNotifications(NotificationDto notificationDto, Pageable pageable);

  // 2. 관리자 페이지 발송 내역 조회용
  Page<NotificationEntity> searchAdminNotices(NotificationDto searchDto, Pageable pageable);
}