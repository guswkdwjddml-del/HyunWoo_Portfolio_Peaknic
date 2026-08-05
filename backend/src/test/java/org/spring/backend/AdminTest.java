// package org.spring.backend;

// import org.junit.jupiter.api.Test;
// import org.spring.backend.admin.repository.NoticeRepository;
// import org.spring.backend.common.BoardCategory;
// import org.spring.backend.common.Role;
// import org.spring.backend.entity.board.BoardEntity;
// import org.spring.backend.repository.MemberRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;

// @SpringBootTest
// public class AdminTest {

//   @Autowired
//   MemberRepository memberRepository;

//   @Autowired
//   NoticeRepository noticeRepository;

//   @Test
//   void memberInsert() {
//     // Optional<TestEntity> optionalTestEntity =
//     // testRepository.findByMemberEmail(testDto.getMemberEmail());
//     // if (optionalTestEntity.isPresent()) {
//     // throw new IllegalArgumentException("이메일이 이미 존재합니다");
//     // }
//     // for (int i = 6; i <= 10; i++) {
//     //   MemberEntity memberEntity = MemberEntity.builder()
//     //       .memberEmail("test" + i + "@email.com")
//     //       .memberPw("1111")
//     //       .memberName("Test User " + i)
//     //       .memberAddr("Address " + i)
//     //       .memberDetail("Detail " + i)
//     //       .gender("Female")
//     //       .hikingLevel(3)
//     //       .role(Role.MEMBER)
//     //       .attachFile(false)
//     //       .build();
//     //   memberRepository.save(memberEntity);
//     }

//   }

//   @Test
//   void noticeInsert() {

//     MemberEntity writerEntity = memberRepository.findById(1L)
//         .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

//     for (int i = 1; i <= 10; i++) {
//       BoardEntity boardEntity = BoardEntity.builder()
//           .boardCategory(BoardCategory.NOTICE)
//           .title("Notice Title " + i)
//           .content("Notice Content " + i)
//           .viewCount(0)
//           .attachFile(false)
//           .memberEntity(writerEntity)
//           .build();
//       noticeRepository.save(boardEntity);
//     }
//   }

//   @Test
//   void faqInsert() {

//     MemberEntity writerEntity = memberRepository.findById(1L)
//         .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

//     for (int i = 1; i <= 10; i++) {
//       BoardEntity boardEntity = BoardEntity.builder()
//           .boardCategory(BoardCategory.FAQ)
//           .title("FAQ Title " + i)
//           .content("FAQ Content " + i)
//           .viewCount(0)
//           .attachFile(false)
//           .memberEntity(writerEntity) // writer로 되어 있던 거 memberEntity로 수정해서 바꿔놨어요 (yein)
//           .build();
//       noticeRepository.save(boardEntity);
//     }

//   }

// }
