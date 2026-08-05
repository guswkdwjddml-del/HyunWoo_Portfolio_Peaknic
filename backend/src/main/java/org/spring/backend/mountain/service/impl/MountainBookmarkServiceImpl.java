package org.spring.backend.mountain.service.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.spring.backend.member.entity.MemberEntity;
import org.spring.backend.member.repository.MemberRepository;
import org.spring.backend.mountain.entity.MountainBookmarkEntity;
import org.spring.backend.mountain.entity.MountainEntity;
import org.spring.backend.mountain.repository.MountainBookmarkRepository;
import org.spring.backend.mountain.repository.MountainRepository;
import org.spring.backend.mountain.service.MountainBookmarkService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MountainBookmarkServiceImpl implements MountainBookmarkService {

  private final MountainBookmarkRepository mountainBookmarkRepository;
  private final MemberRepository memberRepository;
  private final MountainRepository mountainRepository;

  // 현재 접속한 유저가 해당 산을 북마크했는지 상태값을 반환하는 메서드입니다.
  @Override
  @Transactional(readOnly = true)
  public Map<String, Boolean> isBookmarked(Long mountainId, String userEmail) {
    boolean isBookmarked = mountainBookmarkRepository.existsByMemberEntity_UserEmailAndMountainEntity_Id(userEmail,
        mountainId);

    // 프론트엔드의 res.data.isBookmarked 규격에 맞게 Map으로 포장하여 반환합니다.
    Map<String, Boolean> response = new HashMap<>();
    response.put("isBookmarked", isBookmarked);
    return response;
  }

  // 북마크 추가 및 취소를 한 번에 처리(토글)하는 메서드입니다.
  @Override
  @Transactional
  public void toggleBookmark(Long mountainId, String userEmail) {
    // 기존에 누른 북마크 내역이 있는지 조회합니다.
    Optional<MountainBookmarkEntity> bookmarkOpt = mountainBookmarkRepository
        .findByMemberEntity_UserEmailAndMountainEntity_Id(userEmail, mountainId);

    if (bookmarkOpt.isPresent()) {
      // 이미 북마크가 존재하면 삭제
      MountainBookmarkEntity bookmark = bookmarkOpt.get();
      MountainEntity mountain = bookmark.getMountainEntity();
      mountainBookmarkRepository.delete(bookmark);
      // 북마크 취소 시 카운트 1 감소
      mountain.setBookmarkCount(mountain.getBookmarkCount() - 1);
    } else {
      // 북마크 내역이 없으면 회원과 산 정보를 DB에서 찾습니다.
      MemberEntity member = memberRepository.findByUserEmail(userEmail)
          .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
      MountainEntity mountain = mountainRepository.findById(mountainId)
          .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 산입니다."));

      // 새로운 북마크 엔티티를 생성하여 데이터베이스에 저장합니다.
      MountainBookmarkEntity newBookmark = MountainBookmarkEntity.builder()
          .memberEntity(member)
          .mountainEntity(mountain)
          .build();
      mountainBookmarkRepository.save(newBookmark);
      // 북마크 추가 시 카운트 1 증가
      mountain.setBookmarkCount(mountain.getBookmarkCount() + 1);
    }
  }

}
