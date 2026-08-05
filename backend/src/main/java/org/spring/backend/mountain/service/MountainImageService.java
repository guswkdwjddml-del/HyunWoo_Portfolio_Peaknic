package org.spring.backend.mountain.service;

import org.spring.backend.mountain.entity.MountainEntity;

public interface MountainImageService {

  // api조회후 이미지 저장 및 갱신
  void updateMountainImage(MountainEntity mountain);

  // 전체 산 이미지 수집 (DB에 저장된 산 코드 기준) - 컨트롤러 호출용
  public void syncAllMountainImages();

}
