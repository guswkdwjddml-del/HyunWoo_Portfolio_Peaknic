import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cartInsert, cartListPrint } from "../../../store/slice/cartSlice";
import { paymentInsert } from "../../../store/slice/paymentSlice";
import { showApiError } from "../../../utils/commonModule";

// yein - guestId 랜덤값
const createGuestId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

// 크루 상세화면 - 우측 결제/정보 플로팅 사이드바
const CrewDetailSidebar = ({ crew, totalCount, isClosed, isHost, participants, currentUserEmail }) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // yein - 선택한 결제 방법
  const [paymentType, setPaymentType] = useState("");

  // 현재 접속한 유저가 방장이거나 결제 완료자(participants 배열)에 포함되어 있는지 확인
  const isAuthorizedParticipant = participants.some(p => (p.userEmail || p.memberEmail) === currentUserEmail);

  // yein - 장바구니 담기
  const cartInsertFn = async () => {
    // 로그인 상태인지 확인
    const accessToken = localStorage.getItem("accessToken");

    // 비로그인 상태면 guestId 확인, 없으면 생성
    let guestId = null;
    if (!accessToken) {
      guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId = createGuestId();
        localStorage.setItem("guestId", guestId);
      }
    }

    try {
      const message = await dispatch(cartInsert({ accessToken, guestId, crewId: crew.id })).unwrap();
      alert(message);
      dispatch(cartListPrint({ accessToken, guestId }));
      navigate(`/cart/list`);
    } catch (error) {
      showApiError(error);
    }
  }

  // yein - 결제하기
  const goToPaymentFn = async () => {
    // 결제 방법 미선택시 결제 불가
    if (paymentType === "") {
      alert("결제 방법을 선택해주세요");
      return;
    }

    // 회원 정보 가져오기
    const accessToken = localStorage.getItem("accessToken");

    // 비회원 상태일 때 결제하기 버튼 클릭시 로그인 페이지로 이동
    if (!accessToken) {
      alert("결제는 로그인 후 이용 가능합니다.");
      navigate(`/auth/login`);
      return;
    }

    try {
      const result = await dispatch(paymentInsert({ crewId: crew.id, paymentType })).unwrap();
      if (result.redirectUrl) {
        // 카카오페이 -> 결제창으로 이동 => 장바구니 정리는 승인 완료 후 진행
        window.location.href = result.redirectUrl;
      } else {
        // 일반 결제 -> 결제 내역으로 이동
        alert(result.message);
        navigate(`/payment/list?tab=CREW`);
      }
    } catch (error) {
      showApiError(error);
    }
  }

  // 방장용 모집 취소 (전액 환불 경고)
  const cancelCrewAsHost = async () => {
    if (window.confirm("🚨 [방장 권한 경고] 모임을 모집 취소하시겠습니까?\n취소 시 현재까지 참여한 모든 참여자들의 결제가 취소 및 전액 환불 처리되며 모임이 종료됩니다.")) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        await axios.post(`/api/crews/${crew.id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        alert("모집 취소 및 환불 처리가 완료되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "취소 처리에 실패했습니다.");
      }
    }
  };

  // 일반 참여자용 참여 취소 경고
  const cancelCrewAsParticipant = async () => {
    if (window.confirm("참여를 취소하시겠습니까?\n취소 시 결제 내역은 규정에 따라 환불 절차가 진행됩니다.")) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        await axios.post(`/api/crews/${crew.id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        alert("참여 취소 처리가 완료되었습니다.");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "참여 취소 처리에 실패했습니다.");
      }
    }
  };

  return (

    <div className="cd-sidebar">
      <div className="cd-floating-card">
        <h2 className="f-title">{crew.crewName}</h2>
        <div className="f-info"><span>현재 인원</span><strong>{totalCount} / {crew.crewPeople} 명</strong></div>
        <div className="f-progress"><div className="f-progress-bar" style={{ width: `${crew.crewPeople ? (totalCount / crew.crewPeople) * 100 : 0}%` }}></div></div>

        {/* 모집 마감에 crewDeadline 매핑 및 빨간색 강조 적용 */}
        <div className="f-info">
          <span>모집마감</span>
          <strong className="deadline-red">
            {crew.crewDeadline?.replace("T", " ").replaceAll("-", ".").substring(0, 16)}
          </strong>
        </div>

        {/* 출발 일시에 crewStartDate 매핑 */}
        <div className="f-info">
          <span>출발일시</span>
          <strong>
            {crew.crewStartDate?.replace("T", " ").replaceAll("-", ".").substring(0, 16)}
          </strong>
        </div>

        <div className="f-info"><span>최소 출발</span><strong>{crew.minPeople || 1} 명</strong></div>
        <div className="f-info">
          <span>참가비</span>
          <strong style={{ color: "#e74c3c", fontSize: "20px" }}>{crew.crewPrice === 0 ? "무료" : `${crew.crewPrice?.toLocaleString()}원`}</strong>
        </div>

        {/* 방장일 때: 모임 수정 및 모집 취소 버튼 (색상 적용) */}
        {isHost && crew.crewStatus !== "CANCELLED" && (
          <div className="f-actions host-actions">
            <button className="btn-wish btn-wish1" onClick={() => navigate(`/crew/update/${crew.id}`)}>
              모임 수정
            </button>
            <button className="btn-wish btn-wish2" onClick={cancelCrewAsHost}>
              모집 취소
            </button>
          </div>
        )}

        {/* 방장이 아닐 때 */}
        {!isHost && (
          <>
            {isAuthorizedParticipant ? (
              <div className="f-actions">
                {/* 🌟 참여중 뱃지와 동일한 파란색 계열 적용 */}
                <button className="btn-join" disabled style={{ backgroundColor: "rgba(41, 128, 185, 0.95)", color: "#fff", cursor: "default" }}>
                  참여중인 크루입니다
                </button>
                <button className="btn-wish btn-wish2" onClick={cancelCrewAsParticipant}>
                  참여 취소하기
                </button>
              </div>
            ) : !isClosed && crew.crewStatus !== "CANCELLED" ? (
              <div className="f-actions">
                <button className="btn-wish" onClick={cartInsertFn}>🛒 장바구니 담기</button>
                <div className="btn-payment">
                  <select name="paymentType" id="paymentType"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}>
                    <option value="">결제 방법 선택</option>
                    <option value="ACCOUNT">계좌</option>
                    <option value="CARD">카드</option>
                    <option value="KAKAO">카카오페이</option>
                    {/* <option value="TOSS">토스</option> */}
                  </select>
                </div>
                <button className="btn-join" onClick={goToPaymentFn}>참여 결제하기</button>
              </div>
            ) : (
              <div className="f-actions">
                <button className="btn-join" disabled>
                  {crew.crewStatus === "CANCELLED" ? "모집 취소됨" : "모집 마감"}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
export default CrewDetailSidebar;