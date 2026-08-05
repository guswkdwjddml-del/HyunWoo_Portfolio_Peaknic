package org.spring.backend.crew.service.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.spring.backend.admin.dto.AdminCrewDto;
import org.spring.backend.common.CancelReason;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.crew.dto.CrewDto;
import org.spring.backend.crew.dto.CrewFileDto;
import org.spring.backend.crew.dto.CrewScheduleDto;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.entity.CrewFileEntity;
import org.spring.backend.crew.entity.CrewScheduleEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.crew.repository.CrewScheduleRepository;
import org.spring.backend.crew.repository.CrewSpecification;
import org.spring.backend.crew.service.CrewService;
import org.spring.backend.customcourse.dto.CustomCourseDto;
import org.spring.backend.customcourse.entity.CustomCourseEntity;
import org.spring.backend.customcourse.repository.CustomCourseRepository;
import org.spring.backend.member.dto.MemberDto;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.notification.service.NotificationService;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.policy.RefundPolicyCalculator;
import org.spring.backend.payment.service.RefundService;
import org.spring.backend.s3upload.S3UploadService;
import org.spring.backend.settlement.entity.SettlementEntity;
import org.spring.backend.trail.repository.TrailRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CrewServiceImpl implements CrewService {

  private final CrewRepository crewRepository;
  private final MemberRepository memberRepository;
  private final MountainRepository mountainRepository;
  private final CustomCourseRepository customCourseRepository;
  private final CrewScheduleRepository crewScheduleRepository;
  private final NotificationService notificationService;
  private final TrailRepository trailRepository;
  private final RefundPolicyCalculator refundPolicyCalculator;
  private final RefundService refundService;
  private final S3UploadService s3UploadService;

  // ============================= 1. 크루 만들기 ============================= //
  @Override
  public Long insertCrew(CrewDto crewDto, String userEmail) {
    MemberEntity member = getMemberByEmail(userEmail);
    MountainEntity mountain = getMountainById(crewDto.getMountainId());

    // 프론트 crewCreate에서 customCourse 설정 시 로직(논리구조 및 쓸데없는DB생성방지)
    CustomCourseEntity customCourse = null;
    if (crewDto.getCustomCourseId() != null) {
      customCourse = getCustomCourseById(crewDto.getCustomCourseId());
    } else if (crewDto.getCourseData() != null) {

      CustomCourseDto dto = crewDto.getCourseData();

      customCourse = CustomCourseEntity.builder()
          .mountainName(dto.getMountainName())
          .courseName(dto.getCourseName())
          .totalDistance(dto.getTotalDistance())
          .totalTime(dto.getTotalTime())
          .maxAltitude(dto.getMaxAltitude())
          .startLat(dto.getStartLat())
          .startLon(dto.getStartLon())
          .endLat(dto.getEndLat())
          .endLon(dto.getEndLon())
          .selectedPath(dto.getSelectedPath())
          .selectedSegments(dto.getSelectedSegments())
          .trailEntity(
              dto.getTrailId() != null
                  ? trailRepository.findById(dto.getTrailId()).orElse(null)
                  : null)
          .memberEntity(member)
          .build();

      customCourse = customCourseRepository.save(customCourse);
    }

    CrewEntity crewEntity = CrewEntity.builder()
        .crewName(crewDto.getCrewName())
        .crewPrice(crewDto.getCrewPrice())
        .crewDetail(crewDto.getCrewDetail())
        .crewPeople(crewDto.getCrewPeople())
        .minPeople(crewDto.getMinPeople() != null ? crewDto.getMinPeople() : 1) // 최소 인원 적용 (기본값 1)
        .currentPeople(1) // 방장 포함 1부터 시작
        .crewDeadline(crewDto.getCrewDeadline())
        .crewStartDate(crewDto.getCrewStartDate())
        .crewEndDate(crewDto.getCrewEndDate())
        .meetingPlace(crewDto.getMeetingPlace())
        .meetingLat(crewDto.getMeetingLat())
        .meetingLng(crewDto.getMeetingLng())
        .crewStatus(CrewStatus.RECRUITING) // 처음만들었을때 모집중(recruiting)
        .chatLink(crewDto.getChatLink())
        .minAge(crewDto.getMinAge())
        .maxAge(crewDto.getMaxAge())
        .crewLevel(crewDto.getCrewLevel())
        .tags(parseTags(crewDto.getTags())) // String태그 -> List배열로 반환
        .memberEntity(member)
        .mountainEntity(mountain)
        .customCourseEntity(customCourse)
        .build();

    // 저장 메서드 (S3 업로드 적용)
    saveCrewFiles(crewDto.getFiles(), crewEntity);

    CrewEntity saved = crewRepository.save(crewEntity);

    // 방장에게 생성 완료 알림
    notificationService.sendCrew(
        member.getId(), // memberId
        "크루가 성공적으로 생성되었습니다.", // message
        "/crew/" + saved.getId()); // relatedUrl , 프론트의 라우터주소와 동일하게

    return saved.getId();
  }

  // ============================= 2. 크루 수정 ============================= //
  @Override
  public void updateCrew(Long id, CrewDto crewDto, String userEmail) {
    CrewEntity crew = crewRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    validateCrewOwner(crew, userEmail); // 권한 검증
    // 산정보 변경
    crew.setMountainEntity(getMountainById(crewDto.getMountainId()));
    // 커스텀코스 기본값 설정
    CustomCourseEntity customCourse = crew.getCustomCourseEntity();

    // 1. 기존 코스를 선택한 경우
    if (crewDto.getCustomCourseId() != null) {
      customCourse = getCustomCourseById(crewDto.getCustomCourseId());
    }

    // 2. 프론트에서 새 커스텀 코스를 전달한 경우
    else if (crewDto.getCourseData() != null) {
      CustomCourseDto dto = crewDto.getCourseData();
      // 기존 커스텀코스가 있다면 수정
      if (crew.getCustomCourseEntity() != null) {
        customCourse = crew.getCustomCourseEntity();
        customCourse.setMountainName(dto.getMountainName());
        customCourse.setCourseName(dto.getCourseName());
        customCourse.setTotalDistance(dto.getTotalDistance());
        customCourse.setTotalTime(dto.getTotalTime());
        customCourse.setMaxAltitude(dto.getMaxAltitude());
        customCourse.setStartLat(dto.getStartLat());
        customCourse.setStartLon(dto.getStartLon());
        customCourse.setEndLat(dto.getEndLat());
        customCourse.setEndLon(dto.getEndLon());
        customCourse.setSelectedPath(dto.getSelectedPath());
        customCourse.setSelectedSegments(dto.getSelectedSegments());
        customCourse
            .setTrailEntity(dto.getTrailId() != null ? trailRepository.findById(dto.getTrailId()).orElse(null) : null);
      }
      // 기존 코스가 없으면 새 생성
      else {
        customCourse = CustomCourseEntity.builder()
            .mountainName(dto.getMountainName())
            .courseName(dto.getCourseName())
            .totalDistance(dto.getTotalDistance())
            .totalTime(dto.getTotalTime())
            .maxAltitude(dto.getMaxAltitude())
            .startLat(dto.getStartLat())
            .startLon(dto.getStartLon())
            .endLat(dto.getEndLat())
            .endLon(dto.getEndLon())
            .selectedPath(dto.getSelectedPath())
            .selectedSegments(dto.getSelectedSegments())
            .trailEntity(dto.getTrailId() != null ? trailRepository.findById(dto.getTrailId()).orElse(null) : null)
            .memberEntity(crew.getMemberEntity())
            .build();
        customCourse = customCourseRepository.save(customCourse);
      }
    }

    // Crew와 연결
    crew.setCustomCourseEntity(customCourse);
    crew.setCrewName(crewDto.getCrewName());
    crew.setCrewPrice(crewDto.getCrewPrice());
    crew.setCrewDetail(crewDto.getCrewDetail());
    crew.setCrewPeople(crewDto.getCrewPeople());
    crew.setMinPeople(crewDto.getMinPeople()); // 수정 시 최소인원 바꿀 수 없다면 주석처리
    crew.setCrewDeadline(crewDto.getCrewDeadline());
    crew.setCrewStartDate(crewDto.getCrewStartDate());
    crew.setCrewEndDate(crewDto.getCrewEndDate());
    crew.setMeetingPlace(crewDto.getMeetingPlace());
    crew.setMeetingLat(crewDto.getMeetingLat());
    crew.setMeetingLng(crewDto.getMeetingLng());
    crew.setChatLink(crewDto.getChatLink());
    crew.setMinAge(crewDto.getMinAge());
    crew.setMaxAge(crewDto.getMaxAge());
    crew.setCrewLevel(crewDto.getCrewLevel());
    crew.setTags(parseTags(crewDto.getTags()));

    // 크루일정 수정 메서드
    updateSchedules(crew, crewDto.getSchedules());

    // 크루 파일 삭제 메서드 (S3 버킷 및 DB에서 삭제)
    deleteCrewFile(crew, crewDto.getKeepFile());

    // 새로 업로드된 파일이 있다면 S3에 저장
    if (crewDto.getFiles() != null && !crewDto.getFiles().isEmpty()) {
      saveCrewFiles(crewDto.getFiles(), crew);
    }

    // 파일이 하나라도 남았는지 확인하여 상태값을 갱신
    crew.setAttachFile(!crew.getCrewFileEntities().isEmpty());

    // 방장 알림
    notificationService.sendCrew(
        crew.getMemberEntity().getId(),
        "크루 정보가 수정되었습니다.",
        "/crew/" + crew.getId());

    // 참가자 알림
    crew.getPaymentItemEntities().forEach(paymentItem -> {
      notificationService.sendCrew(
          paymentItem.getPaymentEntity().getMemberEntity().getId(),
          "참여 중인 크루 정보가 수정되었습니다.",
          "/crew/" + crew.getId());
    });
  }

  // =========================== 3. 크루 참가 및 마감 처리 ========================== //
  @Override
  @Transactional
  public void addParticipant(Long crewId) {

    CrewEntity crew = crewRepository.findById(crewId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    // 모집 마감 여부 확인
    if (crew.getCurrentPeople() >= crew.getCrewPeople()) {
      throw new IllegalStateException("이미 모집이 마감된 크루입니다.");
    }

    // 참가 전 상태 저장
    boolean wasClosed = crew.getCrewStatus() == CrewStatus.CLOSED;

    // 참가 인원 증가
    crew.setCurrentPeople(crew.getCurrentPeople() + 1);

    // 인원이 모두 찼으면 모집 마감
    if (crew.getCurrentPeople() == crew.getCrewPeople()) {
      crew.setCrewStatus(CrewStatus.CLOSED);
      crew.setRecruitClosedAt(LocalDateTime.now());
    }

    // ================= 방장 알림 =================
    notificationService.sendCrew(
        crew.getMemberEntity().getId(),
        "새로운 참가자가 신청했습니다.",
        "/crew/" + crew.getId());

    // ================= 모집 마감 알림 =================
    if (!wasClosed && crew.getCrewStatus() == CrewStatus.CLOSED) {

      // 방장
      notificationService.sendCrew(
          crew.getMemberEntity().getId(),
          "크루 모집이 마감되었습니다.",
          "/crew/" + crew.getId());

      // 참가자
      crew.getPaymentItemEntities().forEach(paymentItem -> notificationService.sendCrew(
          paymentItem.getPaymentEntity().getMemberEntity().getId(),
          "참여 중인 크루의 모집이 마감되었습니다.",
          "/crew/" + crew.getId()));
    }
  }

  // ============================= 4. 크루 목록 & 상세 조회 ============================= //
  @Override
  @Transactional(readOnly = true)
  public Page<CrewDto> searchCrews(Long memberId, String keyword, String sido, String sigungu, String mountainName,
      String crewLevel, String crewStatus, List<String> tags, Pageable pageable) {
    Specification<CrewEntity> spec = CrewSpecification.searchWith(memberId, keyword, sido, sigungu, mountainName,
        crewLevel, crewStatus, tags);
    return crewRepository.findAll(spec, pageable).map(this::entityToDto);
  }

  @Override
  public CrewDto detailCrew(Long id) {
    CrewEntity entity = crewRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));
    entity.setViewCount(entity.getViewCount() + 1);
    return entityToDto(entity);
  }

  // ============= 5. 크루 삭제 - 상태값변환(Soft Delete) ============= //
  @Override
  public void deleteCrew(Long id, String userEmail) {
    CrewEntity crew = crewRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    validateCrewOwner(crew, userEmail);

    if (crew.getCrewStatus() == CrewStatus.DELETED) {
      throw new IllegalArgumentException("이미 삭제된 크루입니다.");
    }

    crew.setCrewStatus(CrewStatus.DELETED);
    crew.setDeletedAt(LocalDateTime.now());

    notificationService.sendCrew(
        crew.getMemberEntity().getId(),
        "크루가 삭제되었습니다.",
        "/crew");

    // 참가자 안내
    crew.getPaymentItemEntities().forEach(paymentItem -> {
      notificationService.sendCrew(
          paymentItem.getPaymentEntity().getMemberEntity().getId(),
          "참여 중인 크루가 삭제되었습니다.",
          "/crew");
    });
  }

  // ========= 6. 크루 참여자 목록조회 - 상태값(PaymentStatus - FINISH) ============ //
  @Override
  @Transactional(readOnly = true)
  public List<MemberDto> getCrewParticipants(Long crewId) {

    CrewEntity crew = crewRepository.findById(crewId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    List<MemberEntity> participants = new ArrayList<>();
    participants.add(crew.getMemberEntity());

    List<MemberEntity> crewMembers = crewRepository.findParticipantMembersByCrewId(crewId);
    participants.addAll(crewMembers);

    return participants.stream()
        .map(MemberDto::toMemberDto)
        .collect(Collectors.toList());
  }

  // ========= 7. 크루 취소 -> 크루 취소 및 환불 요청 처리 (방장/참여자 구분) ============ //
  @Override
  @Transactional
  public void cancelCrewParticipation(Long crewId, String userEmail) {
    CrewEntity crew = crewRepository.findById(crewId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    MemberEntity member = getMemberByEmail(userEmail);

    boolean isHost = crew.getMemberEntity().getUserEmail().equals(userEmail);
    if (isHost) {
      if (crew.getCrewStartDate() != null && LocalDateTime.now().isAfter(crew.getCrewStartDate())) {
        throw new IllegalStateException("크루 시작일 전까지만 취소 및 환불이 가능합니다.");
      }
      crew.setCrewStatus(CrewStatus.CANCELLED);
      for (PaymentItemEntity item : crew.getPaymentItemEntities()) {
        PaymentEntity payment = item.getPaymentEntity();
        if (payment.getPaymentStatus() == PaymentStatus.FINISH && item.getRefundStatus() == RefundStatus.NONE) {
          item.setCancelReason(CancelReason.HOST_CANCEL);
          item.setRefundRate(BigDecimal.ONE);
          item.setRefundRequestTime(LocalDateTime.now());
          refundService.refundProcess(item, crew.getCrewName() + " 크루 모집 취소 환불 (" + payment.getOrderNumber() + ")");
        }
      }
      notificationService.sendCrew(member.getId(), "개설하신 크루가 취소되었습니다.", "/crew");
    } else {
      if (crew.getCrewStartDate() != null && !LocalDateTime.now().isBefore(crew.getCrewStartDate())) {
        throw new IllegalStateException("크루 시작일 이후에는 참가 취소가 불가능합니다.");
      }
      PaymentItemEntity myPaymentItem = crew.getPaymentItemEntities().stream()
          .filter(item -> item.getPaymentEntity().getMemberEntity().getId().equals(member.getId()))
          .filter(item -> item.getPaymentEntity().getPaymentStatus() == PaymentStatus.FINISH)
          .filter(item -> item.getRefundStatus() == RefundStatus.NONE)
          .findFirst()
          .orElseThrow(() -> new IllegalArgumentException("해당 크루의 결제 내역이 존재하지 않습니다."));

      BigDecimal refundRate = refundPolicyCalculator.calculateMemberCancelRate(crew, LocalDateTime.now());

      myPaymentItem.setCancelReason(CancelReason.JUNIOR_CANCEL);
      myPaymentItem.setRefundRate(refundRate);
      myPaymentItem.setRefundRequestTime(LocalDateTime.now());
      crew.setCurrentPeople(crew.getCurrentPeople() - 1);

      refundService.refundProcess(myPaymentItem, crew.getCrewName()
          + " 크루 참가 취소 환불 (" + myPaymentItem.getPaymentEntity().getOrderNumber() + ")");

      notificationService.sendCrew(member.getId(), "크루 참여가 취소되었습니다.", "/crew");
    }
  }

  // ------------------ 검증 및 헬퍼 로직 -----------------------//

  private void validateCrewOwner(CrewEntity crew, String userEmail) {
    if (!crew.getMemberEntity().getUserEmail().equals(userEmail)) {
      throw new SecurityException("해당 작업을 수행할 권한이 없습니다.");
    }
  }

  private MemberEntity getMemberByEmail(String email) {
    return memberRepository.findByUserEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
  }

  private MountainEntity getMountainById(Long id) {
    return mountainRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 산입니다."));
  }

  private CustomCourseEntity getCustomCourseById(Long id) {
    if (id == null)
      return null;
    return customCourseRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다."));
  }

  private List<String> parseTags(String tagsString) {
    if (tagsString == null || tagsString.trim().isEmpty())
      return new ArrayList<>();
    return Arrays.asList(tagsString.split(","));
  }

  // S3 파일 저장 메서드
  private void saveCrewFiles(List<MultipartFile> files, CrewEntity crewEntity) {
    if (files == null || files.isEmpty()) {
      crewEntity.setAttachFile(false);
      return;
    }

    boolean hasUploadedFile = false;
    for (MultipartFile file : files) {
      if (file.isEmpty())
        continue;

      String oldFileName = file.getOriginalFilename();
      
      String filePath = oldFileName;

      // S3에 새 이미지 업로드 (IOException 예외 처리 추가)
                try {
                  filePath = s3UploadService.upload(file, "crew");
                } catch (IOException e) {
                    log.error("S3 프로필 이미지 업로드 중 오류 발생: ", e);
                    throw new RuntimeException("프로필 사진 파일 업로드 중 오류가 발생했습니다.");
                }
      
      // URL에서 파일명 추출 (S3 Key 기준)
      String newFileName = filePath.substring(filePath.lastIndexOf("/") + 1);

      CrewFileEntity fileEntity = CrewFileEntity.builder()
          .oldFileName(oldFileName)
          .newFileName(newFileName)
          .filePath(filePath)
          .crewEntity(crewEntity)
          .build();
          
      crewEntity.getCrewFileEntities().add(fileEntity);
      hasUploadedFile = true;
    }

    if (hasUploadedFile) {
      crewEntity.setAttachFile(true);
    }
  }

  // 크루일정 수정메서드
  private void updateSchedules(CrewEntity crew, String schedulesJson) {
    crewScheduleRepository.deleteByCrewEntity(crew);
    if (schedulesJson == null || schedulesJson.trim().isEmpty())
      return;

    try {
      ObjectMapper mapper = new ObjectMapper();
      List<CrewScheduleDto> scheduleList = mapper.readValue(
          schedulesJson, new com.fasterxml.jackson.core.type.TypeReference<List<CrewScheduleDto>>() {
          });

      for (CrewScheduleDto sDto : scheduleList) {
        crewScheduleRepository.save(CrewScheduleEntity.builder()
            .crewEntity(crew)
            .scheduleTime(sDto.getScheduleTime())
            .title(sDto.getTitle())
            .description(sDto.getDescription())
            .build());
      }
    } catch (Exception e) {
      throw new RuntimeException("일정 데이터 처리 중 오류 발생", e);
    }
  }

  // S3 파일 삭제 전용 메서드
  private void deleteCrewFile(CrewEntity crew, List<Long> keepFile) {
    List<Long> keepFiles = keepFile == null ? Collections.emptyList() : keepFile;

    List<CrewFileEntity> deleteFiles = crew.getCrewFileEntities().stream()
        .filter(file -> !keepFiles.contains(file.getId()))
        .collect(Collectors.toList());

    for (CrewFileEntity file : deleteFiles) {
      // 1. S3 버킷에서 파일 삭제 (filePath 또는 newFileName/Key 전달)
      s3UploadService.deleteFile(file.getFilePath());

      // 2. DB 연관관계 제거 (orphanRemoval=true로 DB 삭제 자동 처리)
      crew.getCrewFileEntities().remove(file);
    }
  }

  // ============ 관리자페이지 모임(crew)관리용 ==============//

  @Override
  @Transactional(readOnly = true)
  public Page<AdminCrewDto> adminCrewList(Long memberId, String keyword, String sido, String sigungu,
      String mountainName, String crewLevel,
      String crewStatus, List<String> tags, Pageable pageable) {
    Specification<CrewEntity> spec = CrewSpecification.searchWith(memberId, keyword, sido, sigungu, mountainName,
        crewLevel, crewStatus, tags);
    return crewRepository.findAll(spec, pageable).map(this::adminCrewEntityToDto);
  }

  @Override
  public void updateCrewAdmin(Long id, CrewDto crewDto) {
    CrewEntity crew = crewRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    crew.setCrewStatus(crewDto.getCrewStatus());
  }

  @Override
  public void deleteCrewAdmin(Long id) {
    CrewEntity crew = crewRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    if (crew.getCrewStatus() == CrewStatus.DELETED) {
      throw new IllegalArgumentException("이미 삭제된 크루입니다.");
    }

    crew.setCrewStatus(CrewStatus.DELETED);
    crew.setDeletedAt(LocalDateTime.now());
  }

  @Override
  @Transactional(readOnly = true)
  public AdminCrewDto crewSettlementDetail(Long id) {
    CrewEntity crewEntity = crewRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("크루 정보를 찾을 수 없습니다."));
    return adminCrewEntityToDto(crewEntity);
  }

  private AdminCrewDto adminCrewEntityToDto(CrewEntity entity) {
    SettlementEntity settlement = entity.getSettlementEntity();

    return AdminCrewDto.builder()
        .id(entity.getId())
        .crewName(entity.getCrewName())
        .crewPrice(entity.getCrewPrice())
        .crewPeople(entity.getCrewPeople())
        .currentPeople(entity.getCurrentPeople())
        .crewDeadline(entity.getCrewDeadline())
        .crewStartDate(entity.getCrewStartDate())
        .crewStatus(entity.getCrewStatus())
        .mountainName(entity.getMountainEntity().getMountainName())
        .memberId(entity.getMemberEntity().getId())
        .userName(entity.getMemberEntity().getUserName())
        .settlementId(settlement != null ? settlement.getId() : null)
        .settlementStatus(settlement != null ? settlement.getSettlementStatus() : null)
        .totalAmount(settlement != null ? settlement.getTotalAmount() : 0)
        .feeAmount(settlement != null ? settlement.getFeeAmount() : 0)
        .payoutAmount(settlement != null ? settlement.getPayoutAmount() : 0)
        .completedTime(settlement != null ? settlement.getCompletedTime() : null)
        .build();
  }

  // ================================================================//

  private CrewDto entityToDto(CrewEntity entity) {

    CrewDto dto = CrewDto.builder()
        .id(entity.getId())
        .crewName(entity.getCrewName())
        .crewPrice(entity.getCrewPrice())
        .crewDetail(entity.getCrewDetail())
        .crewPeople(entity.getCrewPeople())
        .minPeople(entity.getMinPeople())
        .currentPeople(entity.getCurrentPeople())
        .crewDeadline(entity.getCrewDeadline())
        .crewStartDate(entity.getCrewStartDate())
        .crewEndDate(entity.getCrewEndDate())
        .meetingPlace(entity.getMeetingPlace())
        .meetingLat(entity.getMeetingLat())
        .meetingLng(entity.getMeetingLng())
        .deletedAt(entity.getDeletedAt())
        .crewStatus(entity.getCrewStatus())
        .chatLink(entity.getChatLink())
        .viewCount(entity.getViewCount())
        .minAge(entity.getMinAge())
        .maxAge(entity.getMaxAge())
        .userEmail(entity.getMemberEntity() != null ? entity.getMemberEntity().getUserEmail() : null)
        .crewLevel(entity.getCrewLevel())
        .tags(entity.getTags() != null ? String.join(",", entity.getTags()) : "")
        .memberId(entity.getMemberEntity() != null ? entity.getMemberEntity().getId() : null)
        .memberName(entity.getMemberEntity() != null ? entity.getMemberEntity().getUserName() : "알수없음")
        .mountainId(entity.getMountainEntity() != null ? entity.getMountainEntity().getId() : null)
        .mountainName(entity.getMountainEntity() != null ? entity.getMountainEntity().getMountainName() : "")
        .mountainImageUrl(entity.getMountainEntity() != null ? entity.getMountainEntity().getImageUrl() : null)
        .customCourseId(entity.getCustomCourseEntity() != null ? entity.getCustomCourseEntity().getId() : null)
        .customCourseName(
            entity.getCustomCourseEntity() != null ? entity.getCustomCourseEntity().getCourseName() : "자유 코스")
        .build();

    if (entity.isAttachFile() && !entity.getCrewFileEntities().isEmpty()) {
      dto.setCrewFiles(entity.getCrewFileEntities().stream()
          .map(file -> CrewFileDto.builder()
              .id(file.getId())
              .oldFileName(file.getOldFileName())
              .newFileName(file.getNewFileName())
              .filePath(file.getFilePath())
              .build())
          .collect(Collectors.toList()));
    }

    return dto;
  }

  @Override
  public Page<CrewDto> myJoinedCrews(Long memberId, String keyword, String sido, String sigungu, String mountainName,
      String crewLevel, String crewStatus, List<String> tags, Pageable pageable) {
    return crewRepository.findMyJoinedCrews(
        memberId, keyword, sido, sigungu, mountainName, crewLevel, crewStatus, tags, pageable).map(this::entityToDto);
  }

}