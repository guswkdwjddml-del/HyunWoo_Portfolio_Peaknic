package org.spring.backend.mountain.service.impl;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.spring.backend.mountain.dto.MountainDto;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.entity.MountainFileEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.mountain.service.MountainService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true) // 전체 메서드를 조회 전용으로 속도 최적화
public class MountainServiceImpl implements MountainService {

  private final MountainRepository mountainRepository;

  // 산 조회 (DB)
  @Override
  public Page<MountainDto> searchMountains(Long memberId, String sido, String sigungu, String mountainName, Pageable pageable) {
    // DB에서 키워드와 지역으로 페이징 처리하여 산 찾기 (null 방지를 위해 빈 문자열로 처리됨)
    Page<MountainEntity> mountainPage = mountainRepository.searchMountains(memberId, mountainName, sido, sigungu, pageable);
    // 엔티티 페이지를 DTO 페이지로 깔끔하게 변환하여 반환
    return mountainPage.map(this::mountainEntityToDto);
  }

  // 산 단건 상세 조회
  @Override
  public MountainDto getMountainById(Long id) {
    MountainEntity entity = mountainRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("해당 산 정보를 찾을 수 없습니다."));
    return mountainEntityToDto(entity);
  }

  // MountainEntity -> MountainDto 변환메서드(이미지 추가 될 경우 보일 수 있도록 수정_(sun))
  private MountainDto mountainEntityToDto(MountainEntity entity) {
      MountainDto mountainDto = MountainDto.builder()
        .id(entity.getId())
        .mountainCode(entity.getMountainCode())
        .mountainName(entity.getMountainName())
        .sido(entity.getSido())
        .sigungu(entity.getSigungu())
        .height(entity.getHeight())
        .location(entity.getLocation())
        .management(entity.getManagement())
        .imageUrl(entity.getImageUrl())
        .description(entity.getDescription())
        .recommendCourse(entity.getRecommendCourse())
        .hundredReason(entity.getHundredReason())
        .hasTrail(entity.isHasTrail())
        .bookmarkCount(entity.getBookmarkCount())
        .build();

    // 기존 업로드 이미지 정보 추가
    MountainFileEntity file = entity.getMountainFileEntity();

    if (file != null) {
      mountainDto.setNewFileName(file.getNewFileName());
      mountainDto.setOldFileName(file.getOldFileName());
    }

    return mountainDto;
   }

  // ============ 관리자페이지 산정보관리용(추가_sun) ==============//
  @Override
  public Page<MountainDto> mountainList(Pageable pageable, String subject, String search,
      Boolean noImg, Boolean noDescription) {

    Page<MountainEntity> mountainEntities;
    System.out.println("noImg 여부" + noImg);

    // 체크박스 + 검색식에 따른 목록조회 조건식
    // 이미지 없음 + 산소개 없음
    if (noImg != null && noImg && noDescription != null && noDescription) {
      mountainEntities = mountainRepository.findByHasTrailTrueAndImageUrlIsNullAndDescription("( - )", pageable);
      // 이미지 없음만
    } else if (noImg != null && noImg) {
      mountainEntities = mountainRepository.findByHasTrailTrueAndImageUrlIsNull(pageable);
      // 산소개 없음만
    } else if (noDescription != null && noDescription) {
      mountainEntities = mountainRepository.findByHasTrailTrueAndDescription("( - )", pageable);
    } else if (subject != null && !subject.isBlank() && search != null && !search.isBlank()) {
      // 검색식
      switch (subject) {
        case "mountainName":
          mountainEntities = mountainRepository
              .findByHasTrailTrueAndMountainNameContaining(search, pageable);
          break;
        case "sido":
          mountainEntities = mountainRepository
              .findByHasTrailTrueAndSidoContaining(search, pageable);
          break;
        case "sigungu":
          mountainEntities = mountainRepository
              .findByHasTrailTrueAndSigunguContaining(search, pageable);
          break;
        default:
          mountainEntities = mountainRepository.findByHasTrailTrue(pageable);
      }
    } else {
      mountainEntities = mountainRepository.findByHasTrailTrue(pageable);
    }
    return mountainEntities.map(entity -> mountainEntityToDto(entity));
  }

  // 산정보 수정
  @Transactional
  @Override
  public void mountainUpdate(MountainDto mountainDto) throws IOException {
    System.out.println("========== DTO ==========");
System.out.println("description = " + mountainDto.getDescription());
System.out.println("imageUrl = " + mountainDto.getImageUrl());
System.out.println("deleteFile = " + mountainDto.getDeleteFile());
System.out.println("=========================");

    // 1. 산 조회
    MountainEntity mountainEntity = mountainRepository.findById(mountainDto.getId())
        .orElseThrow(() -> new IllegalArgumentException("산정보가 없습니다."));

    // 2. 산 정보 텍스트 수정(산소개/이미지 URL)
    mountainEntity.setDescription(mountainDto.getDescription());
    mountainEntity.setImageUrl(mountainDto.getImageUrl());

    MultipartFile uploadFile = mountainDto.getMountainFile();
    MountainFileEntity fileEntity = mountainEntity.getMountainFileEntity();

    // ============================
    // 3. 새 파일 업로드(교체)
    // ============================
    if (uploadFile != null && !uploadFile.isEmpty()) {

      // 기존 실제 파일 삭제
      if (fileEntity != null) {
        File deleteFile = new File(
            getMountainUploadPath() + fileEntity.getNewFileName());

        if (deleteFile.exists()) {
          deleteFile.delete();
        }
      }

      String oldFileName = uploadFile.getOriginalFilename();

      if (oldFileName == null || oldFileName.isBlank()) {
        throw new IllegalArgumentException("파일명이 없습니다.");
      }

      String newFileName = UUID.randomUUID() + "_" + oldFileName;

      uploadFile.transferTo(
          new File(getMountainUploadPath() + newFileName));

      if (fileEntity == null) {

        // 최초 등록 → INSERT
        fileEntity = MountainFileEntity.builder()
            .oldFileName(oldFileName)
            .newFileName(newFileName)
            .filePath("/upload/mountain/" + newFileName)
            .mountainEntity(mountainEntity)
            .build();

        mountainEntity.setMountainFileEntity(fileEntity);

      } else {

        // 파일 교체 → UPDATE
        fileEntity.setOldFileName(oldFileName);
        fileEntity.setNewFileName(newFileName);
        fileEntity.setFilePath("/upload/mountain/" + newFileName);
      }

    }

    // ============================
    // 4. 삭제만 하는 경우
    // ============================
    else if (Boolean.TRUE.equals(mountainDto.getDeleteFile())) {

      if (fileEntity != null) {

        File deleteFile = new File(
            getMountainUploadPath() + fileEntity.getNewFileName());

        if (deleteFile.exists()) {
          deleteFile.delete();
        }

        mountainEntity.setMountainFileEntity(null);
      }
    }

    // 5. 저장
    mountainRepository.save(mountainEntity);
  }


  // 파일 경로-> 환경변수 설정
  @Value("${app.upload.base-path}")
  private String uploadPath;

  @Value("${app.upload.dir.mountain}")
  private String mountainDir;

  // 파일 업로드 경로
  private String getMountainUploadPath() {

    System.out.println("uploadPath = " + uploadPath); // 디버깅용
    System.out.println("mountainDir = " + mountainDir); // 디버깅용

    // 저장경로
    String path = uploadPath.replace("file:///", "");

    File dir = new File(path + mountainDir);

    if (!dir.exists()) {
      dir.mkdirs();
    }

    return dir.getPath() + File.separator;
  }
  // ==========================================================//
}