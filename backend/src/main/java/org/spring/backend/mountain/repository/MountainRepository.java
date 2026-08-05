package org.spring.backend.mountain.repository;

import java.util.List;
import java.util.Optional;

import org.spring.backend.admin.dto.PopularMountainDto;
import org.spring.backend.mountain.entity.MountainEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MountainRepository extends JpaRepository<MountainEntity, Long> {
    // 키워드로 산 검색 (기존)
    List<MountainEntity> findByMountainNameContaining(String keyword);

    // 시/도 검색 (기존)
    List<MountainEntity> findBySido(String sido);

    // 시/도 및 시/군/구 검색 (기존)
    List<MountainEntity> findBySidoAndSigungu(String sido, String sigungu);

    // 이미지 없는 산 조회 (기존)
    @Query("""
            SELECT m
            FROM MountainEntity m
            WHERE m.imageUrl IS NULL
               OR m.imageUrl = ''
            ORDER BY m.id
            """)
    List<MountainEntity> findTop10WithoutImage(Pageable pageable);

    // 코스가 존재하는 산(hasTrail = true)만 검색되도록 조건을 추가
    @Query("SELECT m FROM MountainEntity m " +
            "WHERE m.hasTrail = true " +
            "AND (:memberId IS NULL OR m.id IN (SELECT mb.mountainEntity.id FROM MountainBookmarkEntity mb WHERE mb.memberEntity.id = :memberId)) "
            +
            "AND (:mountainName IS NULL OR :mountainName = '' OR m.mountainName LIKE %:mountainName%) " +
            "AND (:sido IS NULL OR :sido = '' OR m.sido LIKE %:sido%) " +
            "AND (:sigungu IS NULL OR :sigungu = '' OR m.sigungu LIKE %:sigungu%)")
    Page<MountainEntity> searchMountains(
            @Param("memberId") Long memberId,
            @Param("mountainName") String mountainName,
            @Param("sido") String sido,
            @Param("sigungu") String sigungu,
            Pageable pageable);

    // 산 코드 조회
    Optional<MountainEntity> findByMountainCode(Long mountainCode);

    // ============ 관리자페이지 산정보관리용(추가_sun) ==============//
    Page<MountainEntity> findByHasTrailTrue(Pageable pageable);

    Page<MountainEntity> findByHasTrailTrueAndMountainNameContaining(String search, Pageable pageable);

    Page<MountainEntity> findByHasTrailTrueAndSidoContaining(String search, Pageable pageable);

    Page<MountainEntity> findByHasTrailTrueAndSigunguContaining(String search, Pageable pageable);

    Page<MountainEntity> findByHasTrailTrueAndImageUrlIsNull(Pageable pageable);

    Page<MountainEntity> findByHasTrailTrueAndDescription(String description, Pageable pageable);

    Page<MountainEntity> findByHasTrailTrueAndImageUrlIsNullAndDescription(String description, Pageable pageable);

    // Dashboard 출력용
    @Query("""
                select new org.spring.backend.admin.dto.PopularMountainDto(
                    m.id,
                    m.mountainName,
                    m.sido,
                    m.sigungu,
                    m.bookmarkCount
                )
                from MountainEntity m
                order by m.bookmarkCount desc
            """)
    List<PopularMountainDto> findPopularMountains(Pageable pageable);

    // ==========================================================//

}
