package org.spring.backend.crew.entity;

import jakarta.persistence.*;
import lombok.*;

import org.spring.backend.calendar.entity.CalendarEntity;
import org.spring.backend.cart.entity.CartItemEntity;
import org.spring.backend.common.BasicTime;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.crew.config.StringListConverter;
import org.spring.backend.customcourse.entity.CustomCourseEntity;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.settlement.entity.SettlementEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "crew_tb")
public class CrewEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crew_id")
    private Long id; // 아이디 (PK)

    private String crewName; // 크루명

    private int crewPrice; // 크루 참가비

    @Column(columnDefinition = "TEXT")
    private String crewDetail; // 크루 설명글

    private int crewPeople; // 총 모집 인원

    private int currentPeople; // 현재 참여 중인 인원 (결제 완료시 +1)

    private int minPeople; // 최소 출발 인원

    private LocalDateTime crewDeadline; // 크루 모집 마감 날짜

    private LocalDateTime crewStartDate; // 크루 모임 시작 날짜

    private LocalDateTime crewEndDate; // 크루 모임 끝나는 날짜

    private String meetingPlace; // 크루 집합 장소

    private boolean attachFile; // 추가 이미지 파일 여부 (0,1)

    @Enumerated(EnumType.STRING)
    private CrewStatus crewStatus; // 방 상태 : RECRUITING(모집중), CLOSED(마감), COMPLETED(완료), DELETED(삭제 -> yein 추가)

    private String chatLink; // 소통을 위한 오픈채팅방 링크 (결제자에게만 공개용)

    @Builder.Default
    private int viewCount = 0; // 조회수 (인기 크루 정렬용)

    @Builder.Default
    private int likeCount = 0; // 좋아요 (정렬할때 기준잡기가능)

    @Builder.Default
    private int reportCount = 0; // 신고기능 (쓸일있을까? 여유되면 만들자)

    @Builder.Default
    private int bookmarkCount = 0; // 북마크 회수

    // 참가 조건 (옵션)
    private Integer minAge; // 최소 연령 제한
    private Integer maxAge; // 최대 연령 제한
    private String crewLevel; // 난이도 ( 고수,중수,초보 )

    @Convert(converter = StringListConverter.class)
    @Column(length = 500)
    private List<String> tags; // 태그 (20대,30대,초보환영,,,)

    private LocalDateTime deletedAt; // 삭제된 시간

    // yein -> 현재 시간이 모집 마감 날짜보다 지났을 때, STATUS 변환용으로 사용중 (스케쥴러)
    private LocalDateTime recruitClosedAt; // 모집마감된 시간 (마감날짜랑 조금다름. 인원이꽉차서 자동마감되는경우) 관리용이해서 넣음(선택)

    private LocalDateTime completedAt; // 완료된 시간

    private Double meetingLat; // 모이는장소 좌표 (크루 상세에서 지도상표기한다거나 하는경우)

    private Double meetingLng;

    @Builder.Default
    private String color = "#ff9f43"; // 캘린더에 표시될 라벨 색상

    // -------------------------------------------- 연관관계 ----------------------------------------------------------------//

    // N:1 (Member) -> 크루장 정보 불러오기
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity memberEntity;

    // N:1 (Mountain) -> 산 정보 불러오기
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mountain_id")
    private MountainEntity mountainEntity;

    // 1:N (CrewFile) -> 크루 사진 / DB CRUD시 파일도 같이 연동됨
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "crewEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CrewFileEntity> crewFileEntities = new ArrayList<>();

    // 1:N (CartItem) -> 아이템(크루)이 담길 장바구니
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "crewEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<CartItemEntity> cartItemEntities = new ArrayList<>();

    // 1:N (PaymentItem) -> 결제한 아이템(크루)
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "crewEntity", fetch = FetchType.LAZY)
    private List<PaymentItemEntity> paymentItemEntities = new ArrayList<>();

    // 1:N (Calendar) -> 일정
    @Builder.Default
    @OneToMany(mappedBy = "crewEntity", fetch = FetchType.LAZY)
    private List<CalendarEntity> calendarEntities = new ArrayList<>();

    // 1:N (CrewSchedule) 크루 안에서 사용하는 크루일정
    @Builder.Default
    // 정렬 조건을 추가하여 DB에서 가져올 때 항상 ID 오름차순(생성 순서)으로 정렬 - 폴리라인 꼬임방지
    @OneToMany(mappedBy = "crewEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<CrewScheduleEntity> crewScheduleEntities = new ArrayList<>();

    // N:1 (CustomCourse) -> 방 만들때 직접 짠 코스
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_course_id")
    private CustomCourseEntity customCourseEntity;

    // 1:1 (Settlement) -> 크루의 정산여부 조회를 위해------(추가_sun)
    @OneToOne(mappedBy = "crewEntity", fetch = FetchType.LAZY)
    private SettlementEntity settlementEntity;

    // -------------------------------------------- 연관관계 ----------------------------------------------------------------//

}
