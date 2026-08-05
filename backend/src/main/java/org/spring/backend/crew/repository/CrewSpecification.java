package org.spring.backend.crew.repository;

import java.util.ArrayList;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.mountain.entity.MountainEntity;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

// 필터링 조건 클래스
public class CrewSpecification {
    public static Specification<CrewEntity> searchWith(
            Long memberId, String keyword, String sido, String sigungu, String mountainName, String crewLevel, String crewStatus, List<String> tags) {

        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 삭제된 크루(DELETED)는 검색 목록에서 무조건 제외
            predicates.add(builder.notEqual(root.get("crewStatus"), CrewStatus.DELETED));

            // 🌟 [추가] memberId가 전달된 경우 해당 작성자가 등록한 크루만 필터링
            if (memberId != null) {
                predicates.add(builder.equal(root.get("memberEntity").get("id"), memberId));
            }

            // 1. 산 정보(MountainEntity)와 LEFT JOIN (지역, 산 이름 검색을 위해)
            Join<CrewEntity, MountainEntity> mountainJoin = root.join("mountainEntity", JoinType.LEFT);

            // 2. 검색어 필터 (모임 이름 또는 상세 설명에 포함)
            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(builder.or(
                        builder.like(root.get("crewName"), "%" + keyword + "%"),
                        builder.like(root.get("crewDetail"), "%" + keyword + "%")));
            }

            // 3. 지역(시/도, 시/군/구) 및 산 이름 필터
            if (sido != null && !sido.trim().isEmpty()) {
                predicates.add(builder.equal(mountainJoin.get("sido"), sido));
            }
            if (sigungu != null && !sigungu.trim().isEmpty()) {
                predicates.add(builder.equal(mountainJoin.get("sigungu"), sigungu));
            }
            if (mountainName != null && !mountainName.trim().isEmpty()) {
                predicates.add(builder.like(mountainJoin.get("mountainName"), "%" + mountainName + "%"));
            }

            // 프론트엔드에서 넘어온 탭 상태(crewStatus) 필터링
            // 프론트엔드에서 탭을 'ALL'로 선택하면 값이 ""(빈 문자열) 또는 null
            if (crewStatus != null && !crewStatus.trim().isEmpty() && !crewStatus.equals("ALL")) {
                try {
                    // 문자열을 Enum 값으로 변환하여 조건 추가 (예: "RECRUITING", "COMPLETED")
                    CrewStatus statusEnum = CrewStatus.valueOf(crewStatus);
                    predicates.add(builder.equal(root.get("crewStatus"), statusEnum));
                } catch (IllegalArgumentException e) {
                    // 만약 프론트엔드에서 잘못된 상태 문자열을 보낼 경우 안전하게 예외 무시
                    System.out.println("잘못된 crewStatus 파라미터가 전달되었습니다: " + crewStatus);
                }
            }

            // 5. 태그(해시태그 등) 필터: 상세설명(crewDetail)에 해당 단어가 포함되어 있는지 체크
            if (tags != null && !tags.isEmpty()) {
                for (String tag : tags) {
                    if (tag == null || tag.trim().isEmpty()) continue;  // 빈 문자열 방어
                    predicates.add(builder.like(root.get("tags"), "%" + tag + "%"));
                }
            }
            // 6. 난이도 조건 추가
            if (crewLevel != null && !crewLevel.trim().isEmpty()) {
                predicates.add(builder.equal(root.get("crewLevel"), crewLevel));
            }

            // 조립된 모든 조건(AND)을 반환
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

}
