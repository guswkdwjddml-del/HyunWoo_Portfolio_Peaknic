package org.spring.backend.mountain.service;

import java.io.IOException;

import org.spring.backend.mountain.dto.MountainDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MountainService {

  // 산 목록(페이징)
  Page<MountainDto> searchMountains(Long memberId, String sido, String sigungu, String mountainName, Pageable pageable);

  // 산정보(상세) 가져오기
  MountainDto getMountainById(Long id);

  // ============ 관리자페이지 산정보관리용(추가_sun) ==============//
  // 산목록(필터 추가)
  Page<MountainDto> mountainList(Pageable pageable, String subject, String search,
      Boolean noImage, Boolean noDescription);
      
  // 산정보 수정
  void mountainUpdate(MountainDto mountainDto) throws IOException;
  // ==========================================================//

}
