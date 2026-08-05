package org.spring.backend.cart.service.impl;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.spring.backend.cart.dto.CartInsertDto;
import org.spring.backend.cart.dto.CartItemDto;
import org.spring.backend.cart.entity.CartEntity;
import org.spring.backend.cart.entity.CartItemEntity;
import org.spring.backend.cart.repository.CartItemRepository;
import org.spring.backend.cart.repository.CartRepository;
import org.spring.backend.cart.service.CartService;
import org.spring.backend.common.util.SecurityMemberUtil;
import org.spring.backend.crew.dto.CrewFileDto;
import org.spring.backend.crew.entity.CrewEntity;
import org.spring.backend.crew.repository.CrewFileRepository;
import org.spring.backend.crew.repository.CrewRepository;
import org.spring.backend.member.entity.MemberEntity;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService { // yein 작성

  private final CartRepository cartRepository;
  private final CrewRepository crewRepository;
  private final CartItemRepository cartItemRepository;
  private final RedisTemplate<String, Object> redisTemplate; // 비회원 장바구니
  private final SecurityMemberUtil securityMemberUtil; // 회원 정보 불러오기
  private final CrewFileRepository crewFileRepository;

  // 회원 장바구니 담기
  @Override
  @Transactional
  public void cartInsert(CartInsertDto cartInsertDto) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 크루 있는지 확인
    CrewEntity crewEntity = crewRepository.findById(cartInsertDto.getCrewId())
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    // 크루장 본인의 크루는 담을 수 없게 막음
    if (crewEntity.getMemberEntity().getId().equals(memberEntity.getId())) {
      throw new IllegalArgumentException("본인이 개설한 크루는 장바구니에 담을 수 없습니다.");
    }

    // 장바구니 있는지 확인, 없으면 생성
    CartEntity cartEntity = cartRepository.findByMemberEntityId(memberEntity.getId())
        .orElseGet(() -> cartRepository.save(CartEntity.builder().memberEntity(memberEntity).build()));

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

  // 비회원 장바구니 담기
  @Override
  @Transactional
  public void guestCartInsert(CartInsertDto cartInsertDto) {
    // 크루 있는지 확인
    crewRepository.findById(cartInsertDto.getCrewId())
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 크루입니다."));

    // Redis Key 생성
    String key = "cart:guest:" + cartInsertDto.getGuestId();

    // 현재 장바구니에 해당 크루가 이미 담겨있는지 확인
    Boolean crewExist = redisTemplate.opsForSet().isMember(key, cartInsertDto.getCrewId().toString());
    if (Boolean.TRUE.equals(crewExist)) {
      throw new IllegalArgumentException("해당 크루는 이미 장바구니에 담겨있습니다.");
    }

    // Redis 저장
    redisTemplate.opsForSet().add(key, cartInsertDto.getCrewId().toString());

    // 7일동안 장바구니를 사용하지 않으면 Redis Key 자동 삭제
    redisTemplate.expire(key, 7, TimeUnit.DAYS);
  }

  // 회원 장바구니 목록 출력
  @Override
  @Transactional(readOnly = true)
  public List<CartItemDto> cartItemList() {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 장바구니 있는지 확인
    Optional<CartEntity> optionalCart = cartRepository.findByMemberEntityId(memberEntity.getId());

    // 장바구니 없으면 빈 리스트 출력
    if (optionalCart.isEmpty()) {
      return Collections.emptyList();
    }

    // 장바구니 저장
    CartEntity cartEntity = optionalCart.get();

    // 해당 장바구니에 저장된 크루 목록들 출력
    List<CartItemEntity> cartItemEntities = cartItemRepository.findAllByCartEntityId(cartEntity.getId());

    // 장바구니 아이템에 저장된 크루 아이디 출력 (중복 제거)
    List<Long> crewIds = cartItemEntities.stream().map(item -> item.getCrewEntity().getId()).distinct().toList();

    // 크루 아이디 -> 파일 리스트 매핑
    Map<Long, List<CrewFileDto>> crewFilesMap = crewFileRepository.findAllByCrewEntityIdIn(crewIds).stream()
        // 같은 크루 아이디끼리 파일 리스트 묶기
        .collect(Collectors.groupingBy(
            file -> file.getCrewEntity().getId(),
            // CrewFileEntity -> CrewFileDto 타입 변경 후 리스트에 넣기
            Collectors.mapping(file -> CrewFileDto.builder().filePath(file.getFilePath()).build(),
                Collectors.toList())));

    return cartItemEntities.stream().map(item -> {
      CrewEntity crewEntity = item.getCrewEntity();
      return CartItemDto.builder()
          .id(item.getId())
          .crewId(crewEntity.getId())
          .crewName(crewEntity.getCrewName())
          .crewPrice(crewEntity.getCrewPrice())
          .crewPeople(crewEntity.getCrewPeople())
          .currentPeople(crewEntity.getCurrentPeople())
          .crewDeadline(crewEntity.getCrewDeadline())
          .crewStartDate(crewEntity.getCrewStartDate())
          .crewEndDate(crewEntity.getCrewEndDate())
          .meetingPlace(crewEntity.getMeetingPlace())
          .mountainName(crewEntity.getMountainEntity().getMountainName())
          .crewStatus(crewEntity.getCrewStatus())
          // true -> 크루 아이디에 맞는 파일 가져오기 or 빈 리스트 / false -> 빈 리스트
          .crewFiles(crewEntity.isAttachFile() ? crewFilesMap.getOrDefault(crewEntity.getId(), List.of()) : List.of())
          .mountainImageUrl(crewEntity.getMountainEntity().getImageUrl())
          .build();
    }).toList();
  }

  // 비회원 장바구니 목록 출력
  @Override
  @Transactional(readOnly = true)
  public List<CartItemDto> guestCartItemList(String guestId) {
    // Redis Key 생성
    String key = "cart:guest:" + guestId;

    // Redis에 담은 크루 아이디 가져오기
    Set<Object> crewIds = redisTemplate.opsForSet().members(key);

    // 비어있으면 밑에 코드 실행 안하게 return
    if (crewIds == null || crewIds.isEmpty()) {
      return Collections.emptyList();
    }

    // Set 타입에서 Long 타입으로 변환
    List<Long> ids = crewIds.stream().map(id -> Long.valueOf(id.toString())).toList();

    // 크루 있는지 확인
    List<CrewEntity> crews = crewRepository.findAllById(ids);
    if (crews.size() != ids.size()) {
      throw new IllegalArgumentException("존재하지 않는 크루입니다.");
    }

    // 크루 아이디 -> 파일 리스트 매핑
    Map<Long, List<CrewFileDto>> crewFilesMap = crewFileRepository.findAllByCrewEntityIdIn(ids).stream()
        // 같은 크루 아이디끼리 파일 리스트 묶기
        .collect(Collectors.groupingBy(
            file -> file.getCrewEntity().getId(),
            // CrewFileEntity -> CrewFileDto 타입 변경 후 리스트에 넣기
            Collectors.mapping(file -> CrewFileDto.builder().filePath(file.getFilePath()).build(),
                Collectors.toList())));

    // CrewEntity 타입에서 CartItemDto 타입으로 변환해서 반환
    return crews.stream().map(crew -> CartItemDto.builder()
        .crewId(crew.getId())
        .crewName(crew.getCrewName())
        .crewPrice(crew.getCrewPrice())
        .crewPeople(crew.getCrewPeople())
        .currentPeople(crew.getCurrentPeople())
        .crewDeadline(crew.getCrewDeadline())
        .crewStartDate(crew.getCrewStartDate())
        .crewEndDate(crew.getCrewEndDate())
        .meetingPlace(crew.getMeetingPlace())
        .mountainName(crew.getMountainEntity().getMountainName())
        .crewStatus(crew.getCrewStatus())
        // true -> 크루 아이디에 맞는 파일 가져오기 or 빈 리스트 / false -> 빈 리스트
        .crewFiles(crew.isAttachFile() ? crewFilesMap.getOrDefault(crew.getId(), List.of()) : List.of())
        .mountainImageUrl(crew.getMountainEntity().getImageUrl())
        .build())
        .toList();
  }

  // 장바구니 병합 -> 로그인 전에 비회원 상태로 담은 장바구니(Redis) 있으면 회원 CartDB와 merge
  @Override
  @Transactional
  public void cartMerge(String guestId) {
    // === 1. 로그인 회원 장바구니 확인 ===

    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 장바구니 있는지 확인, 없으면 생성
    CartEntity cartEntity = cartRepository.findByMemberEntityId(memberEntity.getId())
        .orElseGet(() -> cartRepository.save(CartEntity.builder().memberEntity(memberEntity).build()));

    // 장바구니 아이템에서 크루 아이디 가져오기
    Set<Long> selectIds = cartEntity.getCartItemEntities().stream().map(id -> id.getCrewEntity().getId())
        .collect(Collectors.toSet());

    // === 2. Redis 장바구니 확인 ===

    // Redis Key 생성
    String key = "cart:guest:" + guestId;

    // Redis에 담은 크루 아이디 가져오기
    Set<Object> crewIds = redisTemplate.opsForSet().members(key);

    // 비어있으면 밑에 코드 실행 안하게 return
    if (crewIds == null || crewIds.isEmpty()) {
      return;
    }

    // Set 타입에서 Long 타입으로 변환
    List<Long> ids = crewIds.stream().map(id -> Long.valueOf(id.toString())).toList();

    // 크루 있는지 확인
    List<CrewEntity> existRedisCrews = crewRepository.findAllById(ids);
    if (existRedisCrews.size() != ids.size()) {
      throw new IllegalArgumentException("존재하지 않는 크루가 포함되어 있습니다.");
    }

    // === 3. Redis와 회원 장바구니 병합 ===

    // Redis 장바구니와 회원 장바구니 비교
    for (CrewEntity redisCrew : existRedisCrews) {
      // 크루장 본인의 크루는 담을 수 없게 막음 -> 병합하지 않고 넘어가기
      if (redisCrew.getMemberEntity().getId().equals(memberEntity.getId())) {
        continue;
      }

      // 회원 장바구니에 Redis 장바구니에 담긴 크루가 있으면 넘어가기
      if (selectIds.contains(redisCrew.getId())) {
        continue;
      }

      // 중복 안되는 크루만 저장
      cartItemRepository.save(CartItemEntity.builder()
          .cartEntity(cartEntity)
          .crewEntity(redisCrew)
          .build());

      // 회원 장바구니에 담긴 크루 아이디 목록에 방금 담은 아이디 추가
      selectIds.add(redisCrew.getId());
    }

    // Redis Key 삭제
    redisTemplate.delete(key);
  }

  // 회원 장바구니 아이템 삭제
  @Override
  @Transactional
  public void cartItemDelete(List<Long> selectIds) {
    // 현재 로그인한 회원 가져오기
    MemberEntity memberEntity = securityMemberUtil.getLoginMember();

    // 선택한 장바구니 아이템이 해당 회원의 것인지 확인
    List<CartItemEntity> cartItemEntities = cartItemRepository.findAllByIdInAndCartEntityMemberEntityId(selectIds,
        memberEntity.getId());
    if (selectIds.size() != cartItemEntities.size()) {
      throw new IllegalArgumentException("장바구니에 없는 아이템이 선택됐습니다.");
    }

    // 장바구니에서 선택한 장바구니 아이템 삭제
    cartItemRepository.deleteAllInBatch(cartItemEntities);
  }

  // 비회원 장바구니 아이템 삭제
  @Override
  @Transactional
  public void guestCartItemDelete(String guestId, List<Long> selectIds) {
    // Redis Key 생성
    String key = "cart:guest:" + guestId;

    // Redis에서 삭제
    redisTemplate.opsForSet().remove(key, selectIds.stream().map(String::valueOf).toArray(Object[]::new));

    // 장바구니가 비었으면 Redis Key 삭제
    Long size = redisTemplate.opsForSet().size(key);
    if (size != null && size == 0) {
      redisTemplate.delete(key);
    }
  }

}
