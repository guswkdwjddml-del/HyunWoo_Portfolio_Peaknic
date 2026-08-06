package org.spring.backend.member.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.spring.backend.board.entity.BoardEntity;
import org.spring.backend.board.entity.BoardLikeEntity;
import org.spring.backend.calendar.entity.CalendarEntity;
import org.spring.backend.cart.entity.CartEntity;
import org.spring.backend.comment.entity.CommentEntity;
import org.spring.backend.comment.entity.CommentLikeEntity;
import org.spring.backend.common.BasicTime;
import org.spring.backend.common.Role;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.customcourse.entity.CustomCourseEntity;
import org.spring.backend.mountain.entity.MountainBookmarkEntity;
import org.spring.backend.notification.entity.NotificationEntity;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.subscribe.entity.SubscribeEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "member_tb")
public class MemberEntity extends BasicTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id; // 아이디 (PK)

    @Column(unique = true)
    private String userEmail; // 이메일

    @Column(nullable = false)
    private String userPw; // 비밀번호

    @Column(nullable = false)
    private String userName; // 이름

    @Column(nullable = false)
    private String phone; // 연락처

    @Column(nullable = false)
    private String address; // 주소 (시, 동)

    private String memberDetail; // 자기소개

    @Column(nullable = false)
    private String gender; // 성별 (남자, 여자)

    private int hikingLevel; // 등산 레벨 (1 ~ 5)

    @Enumerated(EnumType.STRING)
    private Role role; // 권한 (JUNIOR, MEMBER, ADMIN)

    private boolean attachFile; // 0: 기본 이미지, 1: 커스텀 업로드 파일

    private boolean messageAgree;

    private String provider;

    // 1:N (Crew) -> 해당 회원이 만든 모임
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CrewEntity> crewEntities = new ArrayList<>();

    // 1:N (MemberReview) -> 개인 리뷰/평점 작성자
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<MemberReviewEntity> writeMemberReviewEntities = new ArrayList<>();

    // 1:N (MemberReview) -> 리뷰/평점을 받는 회원
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "target", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<MemberReviewEntity> targetMemberReviewEntities = new ArrayList<>();

    // 1:N (Board) -> 게시판 작성자
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<BoardEntity> boardEntities = new ArrayList<>();

    // 1:N (BoardLike) -> 좋아요를 누른 회원 (어떤 게시글에 좋아요를 눌렀는지 확인할 때 사용)
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<BoardLikeEntity> boardLikeEntities = new ArrayList<>();

    // 🌟 1:N에서 1:1(OneToOne) 구조로 변경
    // 자식 엔티티(MemberFileEntity)의 memberEntity 필드와 매핑, 영속성 전이 및 고아 객체 제거 설정
    @OneToOne(mappedBy = "memberEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private MemberFileEntity memberFileEntity;

    // 1:N (MountainBookmark) -> 산 즐겨찾기를 누른 회원 (어떤 글에 좋아요를 눌렀는지 확인할 때 사용)
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<MountainBookmarkEntity> mountainBookmarkEntities = new ArrayList<>();

    // 1:N (Comment) -> 게시판 댓글 작성자
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CommentEntity> commentEntities = new ArrayList<>();

    // 1:N (CommentLike) -> 댓글에 좋아요를 누른 회원 (어떤 댓글에 좋아요를 눌렀는지 확인할 때 사용)
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CommentLikeEntity> commentLikeEntities = new ArrayList<>();

    // 1:N (Subscribe) -> 해당 회원이 결제한 구독권
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<SubscribeEntity> subscribeEntities = new ArrayList<>();

    // ======================= gyu ====================== //

    // 1:N 커스텀 등산로
    @Builder.Default
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE) // 자동삭제 부분이 빠져있어 수정했습니다.
                                                                                                // -- hyun
    private List<CustomCourseEntity> customCourseEntities = new ArrayList<>();

    // 1:N 캘린더 (회원, 관리자, 소모임 공유)
    @Builder.Default
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CalendarEntity> calendarEntities = new ArrayList<>();

    // ======================= gyu ====================== //

    // 1:N (Notification) -> 회원의 알림 목록
    @Builder.Default
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<NotificationEntity> notificationEntities = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<CartEntity> cartEntities = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "memberEntity", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE)
    private List<PaymentEntity> paymentEntities = new ArrayList<>();
}
