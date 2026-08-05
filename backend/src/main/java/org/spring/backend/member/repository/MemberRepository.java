package org.spring.backend.member.repository;

import java.util.List;
import java.util.Optional;

import org.spring.backend.admin.dto.MemberCountDto;
import org.spring.backend.common.Role;
import org.spring.backend.member.entity.MemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface MemberRepository extends JpaRepository<MemberEntity, Long> {

    // 이메일로 회원 정보 조회 (로그인 시 ID 역할을 할 컬럼)
    Optional<MemberEntity> findByUserEmail(String userEmail);

    // 이메일 중복 가입 방지용
    boolean existsByUserEmail(String userEmail);

    // ============ 관리자페이지 회원관리용(추가_sun) ==============//
    Page<MemberEntity> findByUserEmailContaining(String search, Pageable pageable);

    Page<MemberEntity> findByUserNameContaining(String search, Pageable pageable);

    Page<MemberEntity> findByPhoneContaining(String search, Pageable pageable);

    @Query("""
            SELECT m
            FROM MemberEntity m
            WHERE CAST(m.role AS string) LIKE CONCAT('%', :search, '%')
            """)
    Page<MemberEntity> findByRoleContaining(@Param("search") String search, Pageable pageable);

    // Dashboard 출력용
    @Query("""
                select new org.spring.backend.admin.dto.MemberCountDto(
                    count(m),
                    sum(case when m.role = 'ADMIN' then 1 else 0 end),
                    sum(case when m.role = 'HOST' then 1 else 0 end),
                    sum(case when m.role = 'JUNIOR' then 1 else 0 end),
                    sum(case when m.createTime >= CURRENT_DATE then 1 else 0 end)
                )
                from MemberEntity m
            """)
    MemberCountDto countMemberByRole();
    // ========================================================//

    // ---- gyu ---- //
    // 알림 수신 동의를 한 전체 회원 조회
    List<MemberEntity> findByMessageAgreeTrue();

    // 선택한 회원 번호 리스트 중, 알림 수신 동의를 한 회원만 필터링하여 조회
    List<MemberEntity> findByIdInAndMessageAgreeTrue(List<Long> memberId);

    // 권한별 발송 (adminNotification)
    List<MemberEntity> findByRoleAndMessageAgreeTrue(Role role);

    // 특정 회원 검색 (ID, 이름, 이메일 멀티 검색)
    @Query("SELECT m FROM MemberEntity m " +
           "WHERE (:role IS NULL OR m.role = :role) AND (" +
           ":keyword IS NULL OR :keyword = '' OR " +
           "CONCAT(m.id, '') LIKE CONCAT('%', :keyword, '%') OR " +
           "LOWER(m.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.userEmail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MemberEntity> searchMembersForAdmin(@Param("keyword") String keyword, @Param("role") Role role);
    // ---- gyu ----/
}
