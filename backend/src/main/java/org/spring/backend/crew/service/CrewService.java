package org.spring.backend.crew.service;

import java.util.List;

import org.spring.backend.admin.dto.AdminCrewDto;
import org.spring.backend.crew.dto.CrewDto;
import org.spring.backend.member.dto.MemberDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrewService {
  // 크루 방 생성
  Long insertCrew(CrewDto crewDto, String userEmail);

  // 크루 전체 목록 조회
  Page<CrewDto> searchCrews(Long memberId, String keyword, String sido, String sigungu, String mountainName, String crewLevel, String crewStatus, List<String> tags, Pageable pageable);

  // 자신이 참여한 크루목록 조회
  Page<CrewDto> myJoinedCrews(Long memberId, String keyword, String sido, String sigungu, String mountainName,String crewLevel, String crewStatus, List<String> tags, Pageable pageable);
  
  // 크루 상세 조회
  CrewDto detailCrew(Long id);

  // 크루 삭제
  void deleteCrew(Long id, String userEmail);

  // 크루 수정
  void updateCrew(Long id, CrewDto crewDto, String userEmail);

  // 크루 참가 및 마감처리
  public void addParticipant(Long crewId);

  // 결제완료한 참여자 목록보기
  List<MemberDto> getCrewParticipants(Long crewId);

  // 크루 취소 (crewStatus -> CANCELLED , paymentStatus -> REFUNED_REQUEST // 방장일경우 전부 환불요청 // 등산시작 1일전까지 신청가능)
  public void cancelCrewParticipation(Long crewId, String userEmail) ;


  //============ 관리자페이지 모임(crew)관리용(추가_sun) ==============//
  // 관리자 크루 리스트
  Page<AdminCrewDto> adminCrewList(Long memberId, String keyword, String sido, String sigungu, String mountainName, String crewList,
      String crewStatus, List<String> tags, Pageable pageable);
  // 관리자 크루 수정
  void updateCrewAdmin(Long id, CrewDto crewDto);
  // 관리자 크루 삭제
  void deleteCrewAdmin(Long id);
  // 관리자 크루 정산
  AdminCrewDto crewSettlementDetail(Long id);
  //================================================================//


}
