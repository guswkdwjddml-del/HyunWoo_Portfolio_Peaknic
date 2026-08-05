package org.spring.backend.notification.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.spring.backend.common.NotificationType;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;


public interface NotificationRepository extends JpaRepository<NotificationEntity, Long>, NotificationRepositoryCustom {

  // 삭제(isDeleted)는 false값 임

  // 회원(memberEntity.getId)의 알림 목록 조회 (최신순)
  Page<NotificationEntity> findByMemberEntity_IdAndIsDeletedFalseOrderByCreateTimeDesc(Long memberId,
      Pageable pageable);

  // 회원의 삭제되지 않은 읽지 않은 알림 목록 조회 (최신순)
  Page<NotificationEntity> findByMemberEntity_IdAndIsReadFalseAndIsDeletedFalseOrderByCreateTimeDesc(Long memberId,
      Pageable pageable);

  // 회원의 전체 알림 조회 (자기자신)
  Page<NotificationEntity> findByMemberEntity_IdAndIsDeletedFalse(Long memberId, Pageable pageable);

  // 회원의 안읽은 알림갯수
  long countByMemberEntity_IdAndIsReadFalseAndIsDeletedFalse(Long memberId);

  // 알림삭제 (상태만 true 변경)
  Optional<NotificationEntity> findByIdAndIsDeletedFalse(Long notificationId);

  // 스케쥴러 n일 이후 삭제 (DB에서 영구삭제)
  List<NotificationEntity> findByIsDeletedTrueAndUpdateTimeBefore(LocalDateTime time);
  
  // 관리자가 발송한 알림 목록 조회 (관리자 페이지용, 최신순)
  Page<NotificationEntity> findByNotificationTypeOrderByCreateTimeDesc(NotificationType type, Pageable pageable);

  // 알림 전체읽음 (isRead.true 상태변경 ,쿼리문활용-빠르게 조회)
  @Modifying
  @Transactional
  @Query("""
          update NotificationEntity n
          set n.isRead = true
          where n.memberEntity.id = :memberId
            and n.isDeleted = false
            and n.isRead = false
      """)
  int readAll(@Param("memberId") Long memberId);

  // 알림 전체삭제 (isDeleted.true 상태변경)
  @Modifying
  @Transactional
  @Query("""
          update NotificationEntity n
          set n.isDeleted = true
          where n.memberEntity.id = :memberId
            and n.isDeleted = false
      """)
  int deleteAll(@Param("memberId") Long memberId);

  // 관리자알림발송 상태별 조회 (crew,board,payment,,,,)
  List<MemberEntity> findMemberByNotificationType(NotificationType notificationType);

}
