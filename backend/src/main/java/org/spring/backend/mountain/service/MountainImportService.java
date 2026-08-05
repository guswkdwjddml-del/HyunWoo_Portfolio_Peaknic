package org.spring.backend.mountain.service;

// 관리자 권한 Mountain Service
public interface MountainImportService {

  // 산 데이터저장 (xml형식이라 변환)
  public void saveMountain(int page) throws Exception;

  // 산 정보 저장
  public void syncAllMountainText();

}
