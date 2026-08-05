package org.spring.backend.notification.scheduler;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

import org.spring.backend.notification.entity.NotificationEntity;
import org.spring.backend.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

  private final NotificationRepository notificationRepository;

  @Value("${app.upload.base-path}")
  private String uploadBasePath;

  // 알림 30일후 자동 삭제 (DB에서 영구삭제)
  // 매일 새벽 3시 실행
  @Scheduled(cron = "0 0 3 * * *")
  @Transactional
  public void deleteOldNotification() {
    LocalDateTime limit = LocalDateTime.now().minusDays(30); // 30일 이전
    List<NotificationEntity> list = notificationRepository
        .findByIsDeletedTrueAndUpdateTimeBefore(limit);

    if (!list.isEmpty()) {
      String cleanBasePath = uploadBasePath.replace("file:///", "");

      for (NotificationEntity notification : list) {
        // 알림에 첨부된 이미지가 존재한다면 물리 파일 삭제
        if (notification.getImageUrl() != null && !notification.getImageUrl().isEmpty()) {
          for (String imgPath : notification.getImageUrl()) {
            // imgPath 예: /upload/notification/uuid.jpg
            File file = new File(cleanBasePath, imgPath.replace("/upload/", ""));
            if (file.exists()) {
              file.delete();
            }
          }
        }
      }

      notificationRepository.deleteAll(list);
    }
  }

}
