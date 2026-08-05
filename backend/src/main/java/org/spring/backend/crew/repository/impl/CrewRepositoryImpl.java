package org.spring.backend.crew.repository.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.RefundStatus;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.entity.QCrewEntity;
import org.spring.backend.crew.repository.CrewRepositoryCustom;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.entity.QMemberEntity;
import org.spring.backend.member.entity.QMemberFileEntity;
import org.spring.backend.mountain.entity.QMountainEntity;
import org.spring.backend.payment.entity.QPaymentEntity;
import org.spring.backend.payment.entity.QPaymentItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.util.StringUtils;

import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CrewRepositoryImpl implements CrewRepositoryCustom {

  private final JPAQueryFactory queryFactory;

  @Override
  public Page<CrewEntity> findMyJoinedCrews(
      Long memberId,
      String keyword,
      String sido,
      String sigungu,
      String mountainName,
      String crewLevel,
      String crewStatus,
      List<String> tags,
      Pageable pageable) {
    QCrewEntity crew = QCrewEntity.crewEntity;
    QPaymentItemEntity paymentItem = QPaymentItemEntity.paymentItemEntity;
    QPaymentEntity payment = QPaymentEntity.paymentEntity;
    QMountainEntity mountain = QMountainEntity.mountainEntity;

    // 1. 메인 쿼리: Payment -> PaymentItem -> Crew 조인
    List<CrewEntity> content = queryFactory
        .selectFrom(crew)
        .distinct()
        .leftJoin(crew.paymentItemEntities, paymentItem)
        .leftJoin(paymentItem.paymentEntity, payment)
        .leftJoin(crew.mountainEntity, mountain).fetchJoin()
        .where(
            // yein - paymentItem 인자 추가
            joinedOrHost(crew, paymentItem, payment, memberId),
            crewStatusNotDeleted(crew),
            keywordContains(crew, keyword),
            sidoEq(mountain, sido),
            sigunguEq(mountain, sigungu),
            mountainNameContains(mountain, mountainName),
            crewLevelEq(crew, crewLevel),
            crewStatusFilter(crew, crewStatus),
            tagsContains(crew, tags))
        .offset(pageable.getOffset())
        .limit(pageable.getPageSize())
        .orderBy(getOrderSpecifiers(pageable.getSort(), crew)) // 🌟 정렬 조건 추가
        .fetch();

    // 2. Count 쿼리 (페이징용)
    JPAQuery<Long> countQuery = queryFactory
        .select(crew.countDistinct())
        .from(crew)
        .leftJoin(crew.paymentItemEntities, paymentItem)
        .leftJoin(paymentItem.paymentEntity, payment)
        .leftJoin(crew.mountainEntity, mountain)
        .where(
            // yein - paymentItem 인자 추가
            joinedOrHost(crew, paymentItem, payment, memberId),
            crewStatusNotDeleted(crew),
            keywordContains(crew, keyword),
            sidoEq(mountain, sido),
            sigunguEq(mountain, sigungu),
            mountainNameContains(mountain, mountainName),
            crewLevelEq(crew, crewLevel),
            crewStatusFilter(crew, crewStatus),
            tagsContains(crew, tags));

    return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
  }

  private BooleanExpression crewLevelEq(QCrewEntity crew, String crewLevel) {
    return StringUtils.hasText(crewLevel) ? crew.crewLevel.eq(crewLevel) : null;
  }

  // 🌟 Pageable의 Sort 정보를 QueryDSL의 OrderSpecifier로 변환
  private OrderSpecifier<?>[] getOrderSpecifiers(Sort sort, QCrewEntity crew) {
    List<OrderSpecifier<?>> orders = new ArrayList<>();

    if (sort != null && !sort.isEmpty()) {
      for (Sort.Order order : sort) {
        Order direction = order.isAscending() ? Order.ASC : Order.DESC;
        String prop = order.getProperty();

        PathBuilder<CrewEntity> entityPath = new PathBuilder<>(CrewEntity.class, crew.getMetadata());
        orders.add(new OrderSpecifier<>(direction, entityPath.get(prop, Comparable.class)));
      }
    } else {
      orders.add(crew.id.desc()); // 기본 정렬: 최신순 (id DESC)
    }

    return orders.toArray(new OrderSpecifier[0]);
  }

  // 현재시간 기준 가장 가까운 내가만든 크루
  @Override
  public List<CrewEntity> findUpcomingCreatedCrews(Long memberId, LocalDateTime now) {
    QCrewEntity crew = QCrewEntity.crewEntity;
    QMountainEntity mountain = QMountainEntity.mountainEntity;

    return queryFactory
        .selectFrom(crew)
        .leftJoin(crew.mountainEntity, mountain).fetchJoin()
        .where(
            crew.memberEntity.id.eq(memberId),
            crew.crewStatus.ne(CrewStatus.DELETED),
            crew.crewStartDate.gt(now) // 현재 시간 이후 (미래 일정)
        )
        .orderBy(crew.crewStartDate.asc()) // 다가오는 순
        .limit(2)
        .fetch();
  }

  // 현재시간 기준 가장 가까운 내가참여한 크루
  @Override
  public List<CrewEntity> findUpcomingJoinedCrews(Long memberId, LocalDateTime now) {
    QCrewEntity crew = QCrewEntity.crewEntity;
    QPaymentItemEntity paymentItem = QPaymentItemEntity.paymentItemEntity;
    QPaymentEntity payment = QPaymentEntity.paymentEntity;
    QMountainEntity mountain = QMountainEntity.mountainEntity;

    return queryFactory
        .selectFrom(crew)
        .distinct()
        .innerJoin(crew.paymentItemEntities, paymentItem)
        .innerJoin(paymentItem.paymentEntity, payment)
        .leftJoin(crew.mountainEntity, mountain).fetchJoin()
        .where(
            payment.memberEntity.id.eq(memberId),
            // yein - 환불건 크루는 안보이게
            paymentItem.refundStatus.eq(RefundStatus.NONE),
            crew.crewStatus.ne(CrewStatus.DELETED),
            crew.crewStartDate.gt(now) // 현재 시간 이후 (미래 일정)
        )
        .orderBy(crew.crewStartDate.asc()) // 다가오는 순
        .limit(2)
        .fetch();
  }

  // N+1 문제 해결을 위한 QueryDSL 메서드 구현
  // 크루 참여자(MemberEntity) 목록을 최적화하여 조회 (gyu)
  // paymentstatus.finish 조회
  @Override
  public List<MemberEntity> findParticipantMembersByCrewId(Long crewId) {
    QPaymentItemEntity paymentItem = QPaymentItemEntity.paymentItemEntity;
    QPaymentEntity payment = QPaymentEntity.paymentEntity;
    QMemberEntity member = QMemberEntity.memberEntity;
    QMemberFileEntity memberFile = QMemberFileEntity.memberFileEntity;

    return queryFactory
        .select(member)
        .from(paymentItem)
        .innerJoin(paymentItem.paymentEntity, payment)
        .innerJoin(payment.memberEntity, member)
        .leftJoin(member.memberFileEntity, memberFile).fetchJoin() // 프로필 이미지 한 번에 로딩
        .where(
            paymentItem.crewEntity.id.eq(crewId),
            payment.paymentStatus.eq(PaymentStatus.FINISH),
            // yein 추가 - 환불(완료/실패)건 제외
            paymentItem.refundStatus.eq(RefundStatus.NONE))
        .fetch();
  }

  // --- Dynamic Condition Helpers ---

  private BooleanExpression joinedOrHost(QCrewEntity crew, QPaymentItemEntity paymentItem, QPaymentEntity payment,
      Long memberId) {
    if (memberId == null) {
      return null;
    }

    return crew.memberEntity.id.eq(memberId)
        .or(
            payment.memberEntity.id.eq(memberId)
                .and(payment.paymentStatus.eq(PaymentStatus.FINISH)))
        // yein 추가 - 환불(완료/실패)건 제외
        .and(paymentItem.refundStatus.eq(RefundStatus.NONE));
  }

  private BooleanExpression crewStatusNotDeleted(QCrewEntity crew) {
    return crew.crewStatus.ne(CrewStatus.DELETED);
  }

  private BooleanExpression keywordContains(QCrewEntity crew, String keyword) {
    if (!StringUtils.hasText(keyword))
      return null;
    return crew.crewName.containsIgnoreCase(keyword)
        .or(crew.crewDetail.containsIgnoreCase(keyword));
  }

  private BooleanExpression sidoEq(QMountainEntity mountain, String sido) {
    return StringUtils.hasText(sido) ? mountain.sido.eq(sido) : null;
  }

  private BooleanExpression sigunguEq(QMountainEntity mountain, String sigungu) {
    return StringUtils.hasText(sigungu) ? mountain.sigungu.eq(sigungu) : null;
  }

  private BooleanExpression mountainNameContains(QMountainEntity mountain, String mountainName) {
    return StringUtils.hasText(mountainName) ? mountain.mountainName.containsIgnoreCase(mountainName) : null;
  }

  private BooleanExpression crewStatusFilter(QCrewEntity crew, String crewStatus) {
    if (!StringUtils.hasText(crewStatus) || "ALL".equalsIgnoreCase(crewStatus)) {
      return null;
    }
    try {
      return crew.crewStatus.eq(CrewStatus.valueOf(crewStatus));
    } catch (IllegalArgumentException e) {
      return null; // 잘못된 상태값이 들어와도 터지지 않게 보호
    }
  }

  private BooleanExpression tagsContains(QCrewEntity crew, List<String> tags) {
    if (tags == null || tags.isEmpty())
      return null;

    BooleanExpression expression = null;
    for (String tag : tags) {
      if (StringUtils.hasText(tag)) {
        BooleanExpression tagCondition = crew.tags.contains(tag);
        expression = (expression == null) ? tagCondition : expression.and(tagCondition);
      }
    }
    return expression;
  }
}