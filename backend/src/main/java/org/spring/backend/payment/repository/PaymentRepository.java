package org.spring.backend.payment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.spring.backend.admin.dto.PaymentChartProjection;
import org.spring.backend.admin.dto.PaymentCountDto;
import org.spring.backend.common.PaymentCategory;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.payment.entity.PaymentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> { // yein 작성

    Page<PaymentEntity> findByMemberEntityIdAndPaymentCategoryAndHiddenFalseOrderByCreateTimeDesc(
            Long id, PaymentCategory paymentCategory, Pageable pageable);

    List<PaymentEntity> findByMemberEntityIdOrderByCreateTimeDesc(Long id);

    Optional<PaymentEntity> findByOrderNumber(String orderNumber);

    List<PaymentEntity> findByMemberEntityIdAndPaymentStatusAndPaymentTypeAndPaymentCategory(
            Long id, PaymentStatus ready, PaymentType kakao, PaymentCategory paymentCategory);

    List<PaymentEntity> findByPaymentStatusAndPaymentTypeAndCreateTimeBefore(PaymentStatus ready, PaymentType kakao,
            LocalDateTime expireTime);

    Optional<PaymentEntity> findByOrderNumberAndMemberEntityIdOrderByCreateTimeDesc(String orderNumber, Long id);

    // ============ 관리자페이지 결제관리용(추가_sun) ==============//

    // 결제리스트 조회용
    @Query("""
                SELECT p
                FROM PaymentEntity p
                WHERE (:isAll = true OR p.paymentCategory = :paymentCategory)
                AND (
                    :search IS NULL OR :search = ''
                    OR (:subject = 'id' AND CAST(p.id AS string) LIKE CONCAT('%', :search, '%'))
                    OR (:subject = 'memberId' AND CAST(p.memberEntity.id AS string) LIKE CONCAT('%', :search, '%'))
                    OR (:subject = 'paymentStatus' AND :paymentStatus IS NOT NULL AND p.paymentStatus = :paymentStatus)
                )
            """)
    Page<PaymentEntity> searchPayment(
            @Param("isAll") boolean isAll,
            @Param("paymentCategory") PaymentCategory paymentCategory,
            @Param("subject") String subject,
            @Param("search") String search,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable);

    // Dashboard 출력용
    @Query("""
            select new org.spring.backend.admin.dto.PaymentCountDto(
                    count(p),
                    sum(
                        case
                            when p.createTime >= CURRENT_DATE
                            then 1
                            else 0
                        end
                    )
            )
            from PaymentEntity p
            where p.paymentStatus = 'FINISH'
            """)
    PaymentCountDto countPaymentSummary();

    @Query(value = """
            select
                    date_format(create_time, '%m-%d') as date,
                    count(payment_id) as count,
                    sum(total_price) as amount
            from payment_tb
            where payment_status = 'FINISH'
            and create_time >= date_sub(current_date, interval 7 day)
            group by date_format(create_time, '%m-%d')
            order by date_format(create_time, '%m-%d')
            """, nativeQuery = true)
    List<PaymentChartProjection> paymentChart();
    // ========================================================//

}
