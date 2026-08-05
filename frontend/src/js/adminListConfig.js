import React from 'react'

export const adminListConfig = {

  // 회원관리
  member: {

    searchFields: [
      { value: "userEmail", label: "이메일" },
      { value: "userName", label: "이름" },
      { value: "phone", label: "전화번호" },
      {
        value: "role", label: "권한",
        type: "select",
        options: [
          { label: "일반회원(JUNIOR)", value: "JUNIOR" },
          { label: "구독회원(HOST)", value: "HOST" },
          { label: "관리자(ADMIN)", value: "ADMIN" }
        ]
      }
    ],

    sortFields: [
      { value: "id,desc", label: "최신순" },
      { value: "hikingLevel,desc", label: "등산레벨순" },
    ]

  },

  // 산소개관리
  mountain: {

    searchFields: [
      { value: "mountainName", label: "산이름" },
      { value: "sido", label: "시/도" },
      { value: "sigungu", label: "시/군/구" },
    ],

    sortFields: [
      { value: "id,desc", label: "최신순" },
      { value: "bookmarkCount,desc", label: "즐겨찾기순" },
    ]

  },

  // 크루관리
  crew: {

    searchFields: [
      { value: "keyword", label: "모임명/소개" },
      { value: "mountainName", label: "산이름" },
      // { value: "memberId", label: "모임장(ID)" },
      // { value: "crewLevel", label: "난이도" },
      // { value: "tags", label: "태그" },
      // { value: "crewStatus", label: "진행상태" },
    ],

    sortFields: [
      { value: "crewDeadline,asc", label: "마감임박순" },
      { value: "id,desc", label: "최신순" },
      { value: "viewCount,desc", label: "조회순" },
      { value: "crewLevel,asc", label: "난이도순" },
      // { value: "bookmarkCount,desc", label: "찜회원순" },
    ]

  },

  // 커뮤니티 관리
  board: {
    notice: {
      title: "공지사항",

      searchFields: [
        { value: "title", label: "제목" },
        { value: "content", label: "내용" },
      ],

      sortFields: [
        { value: "id,desc", label: "최신순" },
        { value: "viewCount,desc", label: "조회순" }
      ]
    },


    faq: {
      title: "FAQ",

      searchFields: [
        { value: "title", label: "제목" },
        { value: "content", label: "내용" },
        // { value: "subCategory", label: "질문분류" }
      ],

      sortFields: [
        { value: "id,desc", label: "최신순" },
        { value: "viewCount,desc", label: "조회순" }
      ]
    },


    free: {
      title: "자유게시판",

      searchFields: [
        { value: "title", label: "제목" },
        { value: "content", label: "내용" },
        { value: "userName", label: "작성자" }
      ],

      sortFields: [
        { value: "id,desc", label: "최신순" },
        { value: "likeCount,desc", label: "추천순" },
        { value: "viewCount,desc", label: "조회순" }
      ]
    },


    review: {
      title: "크루리뷰",

      searchFields: [
        { value: "title", label: "제목" },
        { value: "content", label: "내용" },
        { value: "mountainName", label: "산이름" }
      ],

      sortFields: [
        { value: "id,desc", label: "최신순" },
        { value: "viewCount,desc", label: "조회순" }
      ]
    }
  },

  // 결제관리
  payment: {

    searchFields: [
      { value: "id", label: "결제번호(ID)" },
      { value: "memberId", label: "결제자(ID)" },
      {
        value: "paymentStatus", label: "결제상태",
        type: "select",
        options: [
          { label: "전체", value: "" },
          { label: "결제대기", value: "READY" },
          { label: "결제완료", value: "FINISH" },
          { label: "결제실패", value: "FAILED" },
          { label: "결제취소", value: "CALCELLED" },
          { label: "기간만료", value: "EXPIRED" },
          { label: "환불요청", value: "REFUND_REQUEST" },
          { label: "환불완료", value: "REFUND" }
        ]
      },
      {
        value: "paymentType", label: "결제방법",
        type: "select",
        options: [
          { label: "계좌이체", value: "ACCOUNT" },
          { label: "신용/체크카드", value: "CARD" },
          { label: "카카오페이", value: "KAKAO" },
          // { label: "토스페이", value: "TOSS" }
        ]
      }
    ],

    sortFields: [
      { value: "id,desc", label: "최신순" },
      { value: "totalPrice,desc", label: "결제금액순" },
    ]

  }

};