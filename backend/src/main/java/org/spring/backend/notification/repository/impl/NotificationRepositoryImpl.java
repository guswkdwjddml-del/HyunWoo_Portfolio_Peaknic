package org.spring.backend.notification.repository.impl;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.spring.backend.common.NotificationType;
import org.spring.backend.notification.dto.NotificationDto;
import org.spring.backend.notification.entity.NotificationEntity;
import org.spring.backend.notification.entity.QNotificationEntity;
import org.spring.backend.notification.repository.NotificationRepositoryCustom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepositoryCustom {

  private final JPAQueryFactory queryFactory;

  // 1. 사용자 마이페이지 알림 조회용
  @Override
  public Page<NotificationEntity> searchMyNotifications(NotificationDto searchDto, Pageable pageable) {
    QNotificationEntity noti = QNotificationEntity.notificationEntity;
    BooleanBuilder builder = new BooleanBuilder();

    // DTO에서 회원 ID 꺼내어 세팅
    builder.and(noti.memberEntity.id.eq(searchDto.getMemberId()))
        .and(noti.isDeleted.eq(false)); // 삭제되지 않은 알림만 조회

    // searchType 필드를 통해 발송 주체 필터링 ("ALL", "ADMIN_NOTICE", "SYSTEM")
    if ("ADMIN_NOTICE".equalsIgnoreCase(searchDto.getSearchType())) { // [cite: 8]
      builder.and(noti.notificationType.eq(NotificationType.ADMIN_NOTICE));
    } else if ("SYSTEM".equalsIgnoreCase(searchDto.getSearchType())) { // [cite: 8]
      builder.and(noti.notificationType.ne(NotificationType.ADMIN_NOTICE)); // ADMIN_NOTICE가 아닌 모든 알림
    }

    // 특정 알림 타입(CREW, BOARD 등) 필터
    if (searchDto.getNotificationType() != null) { // [cite: 8]
      builder.and(noti.notificationType.eq(searchDto.getNotificationType()));
    }

    // 읽음 여부 필터 (Boolean 래퍼 클래스로 null 처리 완벽 대응)
    if (searchDto.getIsRead() != null) { // [cite: 8]
      builder.and(noti.isRead.eq(searchDto.getIsRead()));
    }

    List<NotificationEntity> content = queryFactory.selectFrom(noti)
        .where(builder).orderBy(noti.createTime.desc())
        .offset(pageable.getOffset()).limit(pageable.getPageSize()).fetch();

    Long total = queryFactory.select(noti.count()).from(noti).where(builder).fetchOne();

    return new PageImpl<>(content, pageable, total == null ? 0 : total);
  }

  // 2. 관리자(AdminNotificationList) - 발송 내역 조회
  @Override
  public Page<NotificationEntity> searchAdminNotices(NotificationDto searchDto, Pageable pageable) {
    QNotificationEntity noti = QNotificationEntity.notificationEntity;
    BooleanBuilder builder = new BooleanBuilder();

    // 기본 조건: 삭제되지 않은 알림
    builder.and(noti.isDeleted.eq(false));

    // 1. 특정 회원 수신 조회 모드 (memberId가 있을 경우)
    if (searchDto.getMemberId() != null) {
      builder.and(noti.memberEntity.id.eq(searchDto.getMemberId()));
    }

    // 2. 전체 / 관리자 / 시스템 필터
    if ("ADMIN_NOTICE".equalsIgnoreCase(searchDto.getSearchType())) {
      builder.and(noti.notificationType.eq(NotificationType.ADMIN_NOTICE));
    } else if ("SYSTEM".equalsIgnoreCase(searchDto.getSearchType())) {
      builder.and(noti.notificationType.ne(NotificationType.ADMIN_NOTICE));
    }

    // 3. 시스템 세부 종류 필터
    if (searchDto.getNotificationType() != null) {
      builder.and(noti.notificationType.eq(searchDto.getNotificationType()));
    }

    // 4. 권한 필터
    if (searchDto.getRole() != null) {
      builder.and(noti.role.eq(searchDto.getRole()));
    }

    // 5. 읽음 상태 필터
    if (searchDto.getIsRead() != null) {
      builder.and(noti.isRead.eq(searchDto.getIsRead()));
    }

    // 6. 기간(날짜) 필터
    if (searchDto.getStartDate() != null) {
      builder.and(noti.createTime.goe(searchDto.getStartDate().atStartOfDay()));
    }
    if (searchDto.getEndDate() != null) {
      builder.and(noti.createTime.loe(searchDto.getEndDate().atTime(23, 59, 59)));
    }

    // 7. 검색어 필터 (제목, 내용, 회원ID, 이메일, 이름)
    if (searchDto.getKeyword() != null && !searchDto.getKeyword().trim().isEmpty()) {
      String keyword = searchDto.getKeyword().trim();
      String field = searchDto.getSearchField();

      if ("title".equals(field)) {
        builder.and(noti.title.containsIgnoreCase(keyword));
      } else if ("message".equals(field)) {
        builder.and(noti.message.containsIgnoreCase(keyword));
      } else if ("memberId".equals(field)) {
        try {
          builder.and(noti.memberEntity.id.eq(Long.parseLong(keyword)));
        } catch (NumberFormatException e) {
          builder.and(noti.memberEntity.id.eq(-1L)); // 숫자가 아니면 검색 안되도록
        }
      } else if ("email".equals(field)) {
        builder.and(noti.memberEntity.userEmail.containsIgnoreCase(keyword));
      } else if ("name".equals(field)) {
        builder.and(noti.memberEntity.userName.containsIgnoreCase(keyword));
      } else {
        // 기본값: 제목 + 내용
        builder.and(noti.title.containsIgnoreCase(keyword).or(noti.message.containsIgnoreCase(keyword)));
      }
    }

    List<NotificationEntity> content = queryFactory.selectFrom(noti)
        .where(builder).orderBy(noti.createTime.desc())
        .offset(pageable.getOffset()).limit(pageable.getPageSize()).fetch();

    Long total = queryFactory.select(noti.count()).from(noti).where(builder).fetchOne();

    return new PageImpl<>(content, pageable, total == null ? 0 : total);
  }
}
