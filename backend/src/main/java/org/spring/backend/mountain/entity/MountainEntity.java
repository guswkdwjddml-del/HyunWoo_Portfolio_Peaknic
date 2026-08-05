package org.spring.backend.mountain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.trail.entity.TrailEntity;

//=============================   산의 기본정보   ========================================//
@Entity
@Table(name = "mountain_tb")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MountainEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mountain_id")
    private Long id;

    private Long mountainCode; // API의 산코드(mntnid)

    @Column(nullable = false)
    private String mountainName; // 산명

    private Integer height; // 높이(m)

    private String location; // 소재지

    private String management; // 관리기관

    private String sido; // 시,도

    private String sigungu; // 시/군/구

    @Column(length = 1000)
    private String imageUrl; // 이미지

    @Column(columnDefinition = "TEXT")
    private String description; // 산 소개

    // 새로 추가: 실제 좌표(coordinates)가 존재하는 등산로가 있는 산인지 여부 -> 산목록에서 조회할때 산은 조회되는데, 등산로없어서
    // 쓸데없는경우 제외시키기
    @Column(columnDefinition = "boolean default false")
    private boolean hasTrail;

    private int bookmarkCount; // 즐겨찾기 개수 (MountainBookmarkEntity와 연동)

    // 100대 명산 선정 이유 - null로떠서 필요없을듯..?
    @Column(columnDefinition = "TEXT")
    private String hundredReason;

    // 추천 코스 설명 - null로떠서 필요없을듯..?
    @Column(columnDefinition = "TEXT")
    private String recommendCourse;

    // ======================================= 연관 관계
    // ============================================ //
    // 1: N 등산로
    @OneToMany(mappedBy = "mountain", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TrailEntity> trails = new ArrayList<>();

    // 1:1 날씨
    @OneToOne(mappedBy = "mountain", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private org.spring.backend.weather.entity.WeatherEntity weather;

    // ====================================== yein
    // ============================================= //

    // 1:N (Crew) -> 해당 크루가 가는 산
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "mountainEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CrewEntity> crewEntities = new ArrayList<>();

    // 1:N (Board) -> REVIEW 카테고리 (산 리뷰) 선택시 정보 사용
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "mountainEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<BoardEntity> boardEntities = new ArrayList<>();

    // 1:N (MountainBookmark) -> 즐겨찾기를 누른 산 게시글 (누가 눌렀는지 확인할 때 사용)
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "mountainEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<MountainBookmarkEntity> mountainBookmarkEntities = new ArrayList<>();

    // ====================================== yein
    // ============================================= //

    // 스케줄러 & API 수집용 업데이트 메서드
    public void updateApiData(String description, String imageUrl) {
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // 관리자(Admin) 수동 입력용 업데이트 메서드
    public void updateAdminInfo(String mountainName, Integer height, String location, String description,
            String imageUrl) {
        if (mountainName != null && !mountainName.isEmpty())
            this.mountainName = mountainName;
        if (height != null)
            this.height = height;
        if (location != null && !location.isEmpty())
            this.location = location;
        if (description != null)
            this.description = description;
        if (imageUrl != null)
            this.imageUrl = imageUrl;

    }

    // ============ 관리자페이지 산 이미지(추가_sun) ==============//
    @OneToOne(
        mappedBy = "mountainEntity", 
        cascade = CascadeType.ALL, 
        orphanRemoval = true, 
        fetch = FetchType.LAZY
    )
    private MountainFileEntity mountainFileEntity;
    // ======================================================= //
}