package org.spring.backend.crew.repository;

import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.member.entity.MemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface CrewRepositoryCustom {
    Page<CrewEntity> findMyJoinedCrews(
            Long memberId,
            String keyword,
            String sido,
            String sigungu,
            String mountainName,
            String crewLevel,
            String crewStatus,
            List<String> tags,
            Pageable pageable
    );

    // 🌟 [추가] 내가 리더인 다가오는 크루 일정 조회
    List<CrewEntity> findUpcomingCreatedCrews(Long memberId, LocalDateTime now);

    // 🌟 [추가] 내가 참여한(결제한) 다가오는 크루 일정 조회
    List<CrewEntity> findUpcomingJoinedCrews(Long memberId, LocalDateTime now);

    // 크루 참여자(MemberEntity) 목록을 최적화하여 조회 (gyu)
    List<MemberEntity> findParticipantMembersByCrewId(Long crewId);
    
}