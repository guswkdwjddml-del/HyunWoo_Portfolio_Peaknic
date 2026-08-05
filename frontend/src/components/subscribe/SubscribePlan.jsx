import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "../../css/subscribe/subscribePlan.css";
import { subscribeDetail, subscribeInsert } from '../../store/slice/subscribeSlice';
import { showApiError } from '../../utils/commonModule';
import { refreshAccessToken } from '../../utils/refreshAccessToken';

// 구독권 타입
const PLANS = [
  { type: "WEEK", label: "1주일", price: 1500, badge: "체험형", desc: "7일간 크루 생성 가능" },
  { type: "MONTH", label: "1개월", price: 4900, badge: "인기", badgeClass: "popular", desc: "30일간 크루 생성 가능" },
  { type: "YEAR", label: "1년", price: 55000, badge: "BEST", badgeClass: "discount", desc: "365일간 자유롭게 크루 생성" }
]

// 결제 방법
const PAYMENT_TYPES = [
  { value: "ACCOUNT", label: "계좌" },
  { value: "CARD", label: "카드" },
  { value: "KAKAO", label: "카카오페이" },
  // { value: "TOSS", label: "토스페이" },
];

// 구독권 만료까지 남은 시간 계산 -> "N일 HH:MM:SS" 반환, 만료됐으면 null 반환
const calculateTimeLeft = (expireTime) => {
  const diff = new Date(expireTime).getTime() - Date.now();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  // 2자리 숫자로 변환 -> 더 짧으면 앞에 0 붙이기
  const pad = (n) => String(n).padStart(2, "0");

  return `${days}일 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const SubscribePlan = () => { // yein 작성

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Store에서 데이터 가져오기
  const { subscribeDetailItem: detail, detailLoading, detailError, insertLoading } = useSelector(state => state.subscribe);

  // 선택한 플랜 타입
  const [subscribeType, setSubscribeType] = useState("MONTH");
  // 선택한 결제 방법
  const [paymentType, setPaymentType] = useState("");
  // 구독권 만료까지 남은 시간
  const [expireLeft, setExpireLeft] = useState("");

  // 구독 내역 (구독 현황) 불러오기
  useEffect(() => {
    // 회원 정보 가져오기
    const accessToken = localStorage.getItem("accessToken");

    // 비회원 상태일 때는 구독 현황 안 불러오기
    if (!accessToken) {
      return;
    }

    const loadSubscribeDetailFn = async () => {
      try {
        await dispatch(subscribeDetail()).unwrap();
      } catch (error) {
        showApiError(error);
      }
    }

    loadSubscribeDetailFn();
  }, [dispatch])

  // 활성 구독 (ACTIVE) 있을 경우 -> 1초마다 남은 시간 갱신
  useEffect(() => {
    if (!detail?.subscribeExpireTime) return;

    const tick = () => {
      const result = calculateTimeLeft(detail.subscribeExpireTime);
      setExpireLeft(result ?? "만료됨");
    };

    tick();

    // 1초마다 남은 시간 갱신
    const intervalId = setInterval(tick, 1000);

    // 컴포넌트 사라질 때 갱신 종료
    return () => clearInterval(intervalId);
  }, [detail]);

  // 구독 현황 재조회 (에러 났을 때 재시도 버튼에서 사용)
  const retryDetailFn = async () => {
    try {
      await dispatch(subscribeDetail()).unwrap();
    } catch (error) {
      showApiError(error);
    }
  };

  // 결제하기
  const goToPaymentFn = async () => {
    // 구독 타입 미선택시 결제 불가
    if (!subscribeType) {
      alert("구독 플랜을 선택해주세요.");
      return;
    }

    // 결제 방법 미선택시 결제 불가
    if (!paymentType) {
      alert("결제 수단을 선택해주세요.");
      return;
    }

    // subscribeInsert loading 상태시 결제 불가
    if (insertLoading) return;

    // 회원 정보 가져오기
    const accessToken = localStorage.getItem("accessToken");

    // 비회원 상태일 때 결제하기 버튼 클릭시 로그인 페이지로 이동
    if (!accessToken) {
      alert("결제는 로그인 후 이용 가능합니다.");
      navigate(`/auth/login`);
      return;
    }

    try {
      const result = await dispatch(subscribeInsert({ subscribeType, paymentType })).unwrap();

      if (result.redirectUrl) {
        // 카카오페이 -> 결제창으로 이동
        window.location.href = result.redirectUrl;
      } else {
        // 일반 결제 -> 결제 내역으로 이동
        alert(result.message);
        // 새 AccessToken 발급 (HOST 변경용)
        await refreshAccessToken(dispatch);
        // 결제 내역으로 이동
        navigate("/payment/list?tab=SUBSCRIBE");
      }
    } catch (error) {
      showApiError(error);
    }
  };

  return (
    <div className="subscribePlan">
      <div className="subscribePlan-con">

        <h2>Peak 플랜 구독</h2>

        {/* 안내 문구 */}
        <div className="info-guide-box">
          <div className="info-guide-title">
            <span className="guide-icon">📢</span>
            <p>안내</p>
          </div>

          <div className="info-guide-text">
            <p>크루를 생성하기 위해서는 Peak 플랜을 구독하셔야 합니다.</p>
            <p>구독이 만료되어도 기존에 생성하신 크루는 사라지지 않습니다.</p>
          </div>
        </div>

        {/* 구독 현황 */}
        {detailLoading ? (
          <div className="timer-status-box subscribeDetail-loading">
            <p>구독 현황을 불러오고 있습니다...</p>
          </div>
        ) : detailError ? (
          <div className="timer-status-box subscribeDetail-error">
            <p>{detailError}</p>
            <button onClick={retryDetailFn}>다시 시도하기</button>
          </div>
        ) : detail ? (
          <div className="timer-status-box">
            <h3>현재 이용 중인 Peak 플랜 - {detail.subscribeType}</h3>

            <div className="timer-display">
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{expireLeft}</span>
            </div>
          </div>
        ) : (
          <div className="timer-status-box subscribeDetail-empty">
            <p>구독 중인 플랜이 없습니다.</p>
          </div>
        )}

        {/* 플랜 상품 선택 */}
        <div className="plan-list">
          <h3>플랜 선택</h3>

          <div className="plan-cards">
            {PLANS.map((plan) => (
              <div key={plan.type}
                className={`plan-card ${subscribeType === plan.type ? 'selected' : ''}`}
                onClick={() => setSubscribeType(plan.type)}>
                <div className="plan-badge">
                  <span className={`badge ${plan.badgeClass ?? ''}`}>{plan.badge}</span>
                  <p>{plan.label}</p>
                </div>

                <div className="plan-price">
                  <p>{plan.price.toLocaleString()}원</p>
                </div>

                <div className="plan-desc">
                  <p>{plan.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 방법 / 결제하기 */}
        <div className="subscribe-payment-box">
          <div className="select-payment-type">
            <select name="paymentType" id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}>
              <option value="">결제 방법 선택</option>
              {PAYMENT_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>

          {/* 구독 상태면 결제 버튼 안눌리게 막음 */}
          <button onClick={goToPaymentFn} disabled={insertLoading || detail}>
            {insertLoading ? "처리 중..." : "Peak 플랜 결제하기"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default SubscribePlan