package org.spring.backend;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.spring.backend.cart.dto.CartItemDto;
import org.spring.backend.cart.entity.CartEntity;
import org.spring.backend.cart.entity.CartItemEntity;
import org.spring.backend.cart.repository.CartItemRepository;
import org.spring.backend.cart.repository.CartRepository;
import org.spring.backend.common.CrewStatus;
import org.spring.backend.common.PaymentStatus;
import org.spring.backend.common.PaymentType;
import org.spring.backend.common.Role;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.payment.entity.PaymentEntity;
import org.spring.backend.payment.entity.PaymentItemEntity;
import org.spring.backend.payment.repository.PaymentItemRepository;
import org.spring.backend.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@Rollback(false)
public class YeinTest { // yein 작성

        @Autowired
        MemberRepository memberRepository;
        @Autowired
        CrewRepository crewRepository;
        @Autowired
        MountainRepository mountainRepository;
        @Autowired
        CartRepository cartRepository;
        @Autowired
        CartItemRepository cartItemRepository;
        @Autowired
        PaymentRepository paymentRepository;
        @Autowired
        PaymentItemRepository paymentItemRepository;
        @Autowired
        RedisTemplate<String, Object> redisTemplate;

        // 멤버 생성
        @Test
        void memberInsert() {
                memberRepository.save(MemberEntity.builder()
                                .userEmail("m1@11")
                                .userPw("11")
                                .userName("m1")
                                .address("서울시 중랑구")
                                .memberDetail("안녕하세요. m1입니다. 많관잘부 ^^")
                                .phone("010")
                                .gender("여자")
                                .hikingLevel(1)
                                .role(Role.MEMBER)
                                .attachFile(false)
                                .build());
        }

        // 산 생성
        @Test
        void mountainInsert() {
                mountainRepository.save(MountainEntity.builder()
                                .mountainName("지리산")
                                .description("머시기")
                                .bookmarkCount(0)
                                .build());
        }

        // 크루 생성
        @Test
        void crewInsert() {
                crewRepository.save(CrewEntity.builder()
                                .crewName("뿡뿡111")
                                .crewPrice(00000)
                                .crewDetail("안녕하세요")
                                .crewPeople(10)
                                .currentPeople(1)
                                .crewDeadline(LocalDateTime.of(2026, 7, 21, 18, 0, 0))
                                .crewStartDate(LocalDateTime.of(2026, 7, 23, 9, 0, 0))
                                .crewEndDate(LocalDateTime.of(2026, 7, 23, 18, 0, 0))
                                .meetingPlace("약수터 앞")
                                .attachFile(false)
                                .memberEntity(MemberEntity.builder().id(2L).build())
                                .mountainEntity(MountainEntity.builder().id(1L).build())
                                .crewStatus(CrewStatus.RECRUITING)
                                .build());
        }

        // 장바구니 생성
        @Test
        void cartInsert() {
                // 회원 있는지 확인
                MemberEntity memberEntity = memberRepository.findById(2L)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));
                // 크루 있는지 확인
                CrewEntity crewEntity = crewRepository.findById(3L)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루"));
                // 장바구니 있는지 확인, 없으면 생성
                CartEntity cartEntity = cartRepository.findByMemberEntityId(memberEntity.getId())
                                .orElseGet(() -> cartRepository
                                                .save(CartEntity.builder().memberEntity(memberEntity).build()));
                // 현재 장바구니에 해당 크루가 이미 담겨있는지 확인
                if (cartItemRepository.existsByCartEntityIdAndCrewEntityId(cartEntity.getId(), crewEntity.getId())) {
                        throw new IllegalArgumentException("해당 크루는 이미 장바구니에 담겨있습니다.");
                }
                // 장바구니에 선택한 크루 넣기
                cartItemRepository.save(CartItemEntity.builder()
                                .cartEntity(cartEntity)
                                .crewEntity(crewEntity)
                                .build());
        }

        // 장바구니 목록 출력
        @Test
        void cartList() {
                // 회원 있는지 확인
                MemberEntity memberEntity = memberRepository.findById(1L)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));
                // 장바구니 있는지 확인
                Optional<CartEntity> optionalCart = cartRepository.findByMemberEntityId(memberEntity.getId());
                // 장바구니 없으면 빈 리스트 출력
                if (optionalCart.isEmpty()) {
                        System.out.println(Collections.emptyList());
                }
                // 장바구니 저장
                CartEntity cartEntity = optionalCart.get();
                // 해당 장바구니에 저장된 크루 목록들 출력
                List<CartItemEntity> cartItemEntities = cartItemRepository.findAllByCartEntityId(cartEntity.getId());
                List<CartItemDto> result = cartItemEntities.stream().map(item -> CartItemDto.builder()
                                .crewName(item.getCrewEntity().getCrewName())
                                .crewPrice(item.getCrewEntity().getCrewPrice())
                                .crewStartDate(item.getCrewEntity().getCrewStartDate())
                                .crewEndDate(item.getCrewEntity().getCrewEndDate())
                                .meetingPlace(item.getCrewEntity().getMeetingPlace())
                                .mountainName(item.getCrewEntity().getMountainEntity().getMountainName())
                                .createTime(item.getCrewEntity().getCreateTime())
                                .updateTime(item.getCrewEntity().getUpdateTime())
                                .build())
                                .toList();
                System.out.println(result);
        }

        // 결제 실행
        @Test
        void paymentInsert() {
                // 회원 있는지 확인
                MemberEntity memberEntity = memberRepository.findById(1L)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원"));
                List<Long> ids = List.of(3L, 4L);
                // 선택한 장바구니 아이템이 해당 회원의 것인지 확인
                List<CartItemEntity> cartItemEntities = cartItemRepository.findAllByIdInAndCartEntityMemberEntityId(ids,
                                memberEntity.getId());
                if (ids.size() != cartItemEntities.size()) {
                        throw new IllegalArgumentException("장바구니에 없는 아이템을 선택했음");
                }
                // 총 금액 계산
                int totalPrice = cartItemEntities.stream().mapToInt(item -> item.getCrewEntity().getCrewPrice()).sum();
                // 결제 내역 생성
                PaymentEntity paymentEntity = paymentRepository.save(PaymentEntity.builder()
                                .totalPrice(totalPrice)
                                .paymentType(PaymentType.ACCOUNT)
                                .paymentStatus(PaymentStatus.READY)
                                .memberEntity(memberEntity)
                                .build());
                // 결제 상세 내역 생성 (선택한 장바구니 아이템 넣기)
                for (CartItemEntity cartItem : cartItemEntities) {
                        paymentItemRepository.save(PaymentItemEntity.builder()
                                        .currentPrice(cartItem.getCrewEntity().getCrewPrice())
                                        .paymentEntity(paymentEntity)
                                        .crewEntity(cartItem.getCrewEntity())
                                        .build());
                }
                // 결제 성공 후 장바구니에서 장바구니 아이템 삭제
                cartItemRepository.deleteAll(cartItemEntities);
        }

        // Redis 연결 테스트
        @Test
        void redisConnect() {
                redisTemplate.opsForValue().set("test", "hello");
                Object value = redisTemplate.opsForValue().get("test");
                System.out.println(value);
        }

}
