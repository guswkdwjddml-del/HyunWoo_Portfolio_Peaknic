// yein 작성

import { paymentHidden } from "../store/slice/paymentSlice";

// 서버 주소 -> ${API_BACK_SERVER_URL}
export const API_BACK_SERVER_URL = ``;

// 서버에서 보낸 에러메세지 alert로 띄우기
export const showApiError = (error) => {
  if (error.response?.data?.message) {
    // JSX에서 axios 직접 사용
    alert(error.response.data.message)
  } else if (error) {
    // Slice -> rejectWithValue(error.response.data.message)
    alert(error);
  } else {
    alert("서버 오류가 발생했습니다.");
  }
}

// 날짜 포맷팅 -> ex) 2026. 07. 08. 오후 06:00
export const formatDateTime = (date) => {
  // date 값이 없으면 공백 return
  if (!date) return "";
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

// 참여 확정 조건 만족하는지 체크
export const showConfirmFn = (crewEndDate, crewStatus, participationConfirmed) => {
  const now = new Date();
  const crewEnd = new Date(crewEndDate);

  return (
    crewStatus === "CLOSED"     // 크루 상태가 마감 상태인지 (정산 이전)
    && now >= crewEnd           // 현재 시간이 크루 모임 끝나는 날짜보다 이후인지
    && !participationConfirmed  // 아직 참여 확정 버튼 안눌렀을 때만
  )
}

// 리뷰 작성 조건 만족하는지 체크
export const showReviewFn = (crewEndDate, crewStatus, reviewConfirmed) => {
  const now = new Date();
  const crewEnd = new Date(crewEndDate);
  const reviewEnd = new Date(crewEnd);

  // 리뷰 작성 마감 날짜: 크루 모임 끝나는 날짜 + 7일
  reviewEnd.setDate(reviewEnd.getDate() + 7);

  return (
    crewStatus === "COMPLETED"  // 크루 상태가 완료 상태인지 (정산 이후)
    && now >= crewEnd           // 현재 시간이 크루 모임 끝나는 날짜보다 이후인지
    && now <= reviewEnd         // 현재 시간이 리뷰 작성 마감 날짜보다 이전인지
    && !reviewConfirmed         // 아직 리뷰 작성 안했을 때만
  )
}

// 참여 취소 조건 만족하는지 체크
export const showCancelFn = (crewStartDate, crewStatus, refundStatus) => {
  const now = new Date();
  const crewStart = new Date(crewStartDate);

  return (
    crewStatus === "RECRUITING" || crewStatus === "CLOSED"  // 크루 상태가 모집중, 모집마감 상태인지
    && now <= crewStart           // 현재 시간이 크루 시작 전날인지
    && refundStatus === "NONE"    // 현재 환불 진행 전인지
  )
}

// 결제 내역 삭제 (숨기기) -> 크루 / 구독
export const paymentHiddenFn = async ({ e, paymentId, dispatch, listThunk, page }) => {
  e.stopPropagation();

  if (!confirm("결제 내역을 삭제하시겠습니까? 삭제 후에는 취소할 수 없습니다.")) return;

  try {
    const result = await dispatch(paymentHidden(paymentId)).unwrap();
    alert(result.message);
    await dispatch(listThunk(page)).unwrap();
  } catch (error) {
    showApiError(error);
  }
}