package org.spring.backend.trail.service;

public interface TrailImportService {
  
  // 관리자 vworld에서 등산코스가져오기
  public String syncMountainFromVWorld(String mountainName);

  // 모든 산을 순회하며 코스 데이터를 채워넣는 메서드 (컨트롤러/스케줄러 호출용)
  public void syncAllTrails();

}
