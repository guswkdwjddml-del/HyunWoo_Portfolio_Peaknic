package org.spring.backend.payment.entity;

import java.util.ArrayList;
import java.util.List;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.PaymentCategory;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.member.entity.MemberEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
@Table(name = "payment_tb")
public class PaymentEntity extends BasicTime { // yein 작성

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id; // 아이디 (PK)

    @Column(unique = true, nullable = false)
    private String orderNumber; // 주문 번호 (P + 날짜 + 랜덤UUID 6자리)

    private int totalPrice; // 총 결제 금액

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType; // 결제 방법

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // 결제 상태

    private String tid; // 카카오페이 결제 고유 번호

    @Enumerated(EnumType.STRING)
    private PaymentCategory paymentCategory; // 결제 종류 (CREW / SUBSCRIBE)

    @Builder.Default // Builder로 생성할 때 기본값 false로
    @Column(nullable = false)
    private boolean hidden = false; // 회원이 결제 상세 내역에서 삭제(숨김) 처리 했는지

    // N:1 (Member) -> 결제한 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private MemberEntity memberEntity;

    // 1:N (PaymentItem) -> 결제 상세 내역 (크루 목록)
    @Builder.Default // -> builder 썼을 때 초기값이 null이 아닌 [] 되게 설정
    @OneToMany(mappedBy = "paymentEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentItemEntity> paymentItemEntities = new ArrayList<>();

}
