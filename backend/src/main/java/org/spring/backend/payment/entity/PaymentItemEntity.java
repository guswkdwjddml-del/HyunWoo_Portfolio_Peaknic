package org.spring.backend.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.spring.backend.common.BasicTime;
import org.spring.backend.common.CancelReason;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.crew.entity.CrewEntity;

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
import jakarta.persistence.Table;
import jakarta.persistence.Version;
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
@Table(name = "payment_item_tb")
public class PaymentItemEntity extends BasicTime { // yein 작성

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_item_id")
    private Long id; // 아이디 (PK)

    private int currentPrice; // 결제한 크루 참가비

    @Builder.Default // Builder로 생성할 때 기본값 false로
    @Column(nullable = false)
    private boolean participationConfirmed = false; // 참여 확정 버튼 눌렀는지

    private LocalDateTime confirmedTime; // 참여 확정 버튼 누른 시간

    @Builder.Default // Builder로 생성할 때 기본값 NONE으로
    @Enumerated(EnumType.STRING)
    private RefundStatus refundStatus = RefundStatus.NONE; // 환불 상태 -> 기본값: 환불 요청 X

    private LocalDateTime refundedTime; // 환불된 시간

    private LocalDateTime refundRequestTime; // 환불 요청한 시간

    @Enumerated(EnumType.STRING)
    private CancelReason cancelReason; // 취소 사유 -> 크루장 모집취소 / 크루원 참가취소

    private BigDecimal refundRate; // 환불 비율 (0.0 ~ 1.0) -> 취소 요청 시점에 따라 다르게 계산

    @Builder.Default
    @Column(nullable = false)
    private int refundRetryCount = 0; // 환불 API 실패 시 재시도 횟수

    @Builder.Default // Builder로 생성할 때 기본값 false로
    @Column(nullable = false)
    private boolean reviewConfirmed = false; // 리뷰 작성했는지

    // N:1 (Payment) -> 결제 내역
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentEntity paymentEntity;

    // N:1 (Crew) -> 결제한 아이템(크루)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crew_id", nullable = true)
    private CrewEntity crewEntity;

    @Version
    private Long version; // 카카오페이 결제 취소 동시 호출 방지용

}
