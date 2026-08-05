package org.spring.backend.notification.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.spring.backend.common.NotificationType;
import org.spring.backend.common.Role;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.notification.dto.NotificationDto;
import org.spring.backend.notification.entity.NotificationEntity;
import org.spring.backend.notification.repository.NotificationRepository;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.s3upload.S3UploadService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final S3UploadService s3UploadService;

    // 1. 알림 생성 및 전송
    @Override
    public NotificationEntity send(Long memberId, NotificationType type, String title, String message,
            String relatedUrl) {

        // 회원 존재 여부 확인
        MemberEntity member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        // 알림 엔티티 생성 및 초기화
        NotificationEntity entity = NotificationEntity.builder()
                .memberEntity(member)
                .notificationType(type)
                .title(title)
                .message(message)
                .relatedUrl(relatedUrl)
                .isRead(false)
                .isDeleted(false)
                .build();

        // 알림 DB에 저장
        NotificationEntity saved = notificationRepository.save(entity);

        // 웹소켓 전송을 위해 DTO로 변환
        NotificationDto dto = convertToDto(saved);

        // RabbitMQ 라우팅 오류 방지를 위해 이메일의 특수문자(@, .)를 언더바(_)로 처리
        String userEmail = member.getUserEmail().replace("@", "_").replace(".", "_");

        // 이메일을 사용하여 실시간 알림 전송
        messagingTemplate.convertAndSend("/queue/notifications." + userEmail, dto);

        return saved;
    }

    // 2. 조회 (필터링)
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> notificationList(NotificationDto notificationDto, Pageable pageable) {
        // DTO를 통째로 Repository에 넘김
        return notificationRepository.searchMyNotifications(notificationDto, pageable)
                .map(this::convertToDto);
    }

    // 3. 관리자 직접 알림 발송 (권한 및 대상자 지정)
    @Override
    public void sendAdminNotice(Long adminId, String targetType, List<Long> memberIds, Role role, String title,
            String message, String relatedUrl, List<MultipartFile> files) {
        
        List<String> uploadedImageUrl = new ArrayList<>();

        // 1. S3 다중 이미지 업로드 처리
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                try {
                    // S3에 'notification' 폴더 경로로 업로드 후 URL 반환
                    String uploadedUrl = s3UploadService.upload(file, "notification");
                    uploadedImageUrl.add(uploadedUrl);
                } catch (IOException e) {
                    log.error("S3 알림 첨부 이미지 업로드 중 오류 발생: ", e);
                    throw new RuntimeException("알림 이미지 업로드 중 오류가 발생했습니다.", e);
                }
            }
        }

        // 2. 수신 동의자 필터링
        List<MemberEntity> targets = new ArrayList<>();

        if ("MEMBER".equals(targetType)) {
            if (memberIds != null && !memberIds.isEmpty()) {
                targets = memberRepository.findByIdInAndMessageAgreeTrue(memberIds);
            }
        } else if ("ROLE".equals(targetType)) {
            if (role != null) {
                targets = memberRepository.findByRoleAndMessageAgreeTrue(role);
            }
        } else {
            // "ALL" 인 경우
            targets = memberRepository.findByMessageAgreeTrue();
        }

        if (targets.isEmpty()) {
            throw new IllegalArgumentException("발송 대상이 없거나 수신 동의한 회원이 없습니다.");
        }

        // 3. 대상자별 알림 생성 및 전송
        for (MemberEntity target : targets) {
            NotificationEntity entity = NotificationEntity.builder()
                    .memberEntity(target)
                    .adminId(adminId)
                    .role(target.getRole())
                    .notificationType(NotificationType.ADMIN_NOTICE)
                    .title(title)
                    .message(message)
                    .relatedUrl(relatedUrl)
                    .imageUrl(uploadedImageUrl.isEmpty() ? null : uploadedImageUrl)
                    .isRead(false)
                    .isDeleted(false)
                    .build();
                    
            NotificationEntity saved = notificationRepository.save(entity);
            NotificationDto dto = convertToDto(saved);

            String userEmail = target.getUserEmail().replace("@", "_").replace(".", "_");
            messagingTemplate.convertAndSend("/queue/notifications." + userEmail, dto);
        }
    }

    // 4. 관리자 알림 발송 내역 조회
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> adminNotificationList(NotificationDto searchDto, Pageable pageable) {
        return notificationRepository.searchAdminNotices(searchDto, pageable).map(this::convertToDto);
    }

    // 읽음
    @Override
    public void read(Long notificationId) {
        NotificationEntity entity = notificationRepository.findByIdAndIsDeletedFalse(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림이 존재하지 않습니다."));
        entity.setIsRead(true);
    }

    // 전체 읽음
    @Override
    public void readAll(Long memberId) {
        notificationRepository.readAll(memberId);
    }

    // 안읽은 알림갯수
    @Override
    @Transactional(readOnly = true)
    public long unreadCount(Long memberId) {
        return notificationRepository.countByMemberEntity_IdAndIsReadFalseAndIsDeletedFalse(memberId);
    }

    // 삭제 (상태만 true로 변경)
    @Override
    public void delete(Long notificationId) {
        NotificationEntity entity = notificationRepository.findByIdAndIsDeletedFalse(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림이 존재하지 않습니다."));
        entity.setIsDeleted(true); // 상태변경
    }

    // 전체 삭제 (상태만 true로 변경)
    @Override
    public void deleteAll(Long memberId) {
        notificationRepository.deleteAll(memberId);
    }

    // ------------- 편의 메서드 ---------------- //
    // 관리자
    @Override
    public NotificationEntity sendAdmin(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.ADMIN, "관리자", message, relatedUrl);
    }

    // 회원
    @Override
    public NotificationEntity sendMember(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.MEMBER, "회원", message, relatedUrl);
    }

    // 결제내역
    @Override
    public NotificationEntity sendPayment(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.PAYMENT, "결제", message, relatedUrl);
    }

    // 장바구니
    @Override
    public NotificationEntity sendCart(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.CART, "장바구니", message, relatedUrl);
    }

    // 자유게시판
    @Override
    public NotificationEntity sendBoard(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.BOARD, "자유게시판", message, relatedUrl);
    }

    // 산 정보
    @Override
    public NotificationEntity sendMountain(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.MOUNTAIN, "산 정보", message, relatedUrl);
    }

    // 크루
    @Override
    public NotificationEntity sendCrew(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.CREW, "크루", message, relatedUrl);
    }

    // 날씨
    @Override
    public NotificationEntity sendWeather(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.WEATHER, "날씨", message, relatedUrl);
    }

    // 리뷰
    @Override
    public NotificationEntity sendReview(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.REVIEW, "리뷰", message, relatedUrl);
    }

    // 공지사항
    @Override
    public NotificationEntity sendNotice(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.NOTICE, "공지사항", message, relatedUrl);
    }

    // 댓글
    @Override
    public NotificationEntity sendComment(Long memberId, String message, String relatedUrl) {
        return send(memberId, NotificationType.COMMENT, "댓글", message, relatedUrl);
    }

    // ------------- 편의 메서드 ---------------- //

    // entity -> dto 변환 메서드
    private NotificationDto convertToDto(NotificationEntity entity) {

        return NotificationDto.builder()
                .id(entity.getId())
                .memberId(entity.getMemberEntity().getId())
                .notificationType(entity.getNotificationType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .relatedUrl(entity.getRelatedUrl())
                .isRead(entity.getIsRead())
                .createTime(entity.getCreateTime())
                .imageUrl(entity.getImageUrl())
                .adminId(entity.getAdminId())
                .role(entity.getRole())
                .build();
    }

}