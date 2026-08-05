// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { updateUserInfo } from '../../store/slice/authSlice'; // 👈 1. updateUserInfo import 추가
// import { showApiError } from '../../utils/commonModule';

// const MySubscribe = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Redux 또는 로그인 유저 정보
//   const { isUser } = useSelector((state) => state.auth || state.member);

//   const [selectedPlan, setSelectedPlan] = useState('MONTH'); // 기본 선택: 1개월
//   const [paymentType, setPaymentType] = useState('');
//   const [timeLeftStr, setTimeLeftStr] = useState('');

//   // 🌟 실시간 남은 구독 시간 계산 타이머 (n일 n시간 n분 n초)
//   useEffect(() => {
//     if (!isUser?.subscribeTime) {
//       setTimeLeftStr('구독 중인 플랜이 없습니다.');
//       return;
//     }

//     let timer = null; // 👈 타이머 참조 변수 선언

//     const calculateTimeLeft = () => {
//       const now = new Date().getTime();
//       const expiry = new Date(isUser.subscribeTime).getTime();
//       const diff = expiry - now;

//       if (diff <= 0) {
//         setTimeLeftStr('구독이 만료되었습니다.');
//         if (timer) clearInterval(timer);
//         return;
//       }

//       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//       const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//       const minutes = Math.floor((diff / 1000 / 60) % 60);
//       const seconds = Math.floor((diff / 1000) % 60);

//       setTimeLeftStr(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
//     };

//     calculateTimeLeft();
//     timer = setInterval(calculateTimeLeft, 1000);

//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [isUser?.subscribeTime]);

//   // 플랜 결제 진행
//   const handlePayment = async () => {
//     const accessToken = localStorage.getItem('accessToken');
//     if (!accessToken) {
//       alert('결제는 로그인 후 이용 가능합니다.');
//       navigate('/auth/login');
//       return;
//     }

//     if (!paymentType) {
//       alert('결제 수단을 선택해주세요.');
//       return;
//     }

//     try {
//       const result = await dispatch(
//         paymentSubscribeInsert({ planType: selectedPlan, paymentType })
//       ).unwrap();

//       // 외부 결제 페이지 리다이렉트 (카카오페이 / 토스페이 등)
//       if (result?.redirectUrl) {
//         window.location.href = result.redirectUrl;
//       } else {
//         alert('Peak 플랜 구매가 완료되었습니다!');
        
//         // 👈 2. 백엔드 결제 결과에 전달된 subscribeTime 반영
//         if (result?.subscribeTime) {
//           dispatch(updateUserInfo({ subscribeTime: result.subscribeTime }));
//         }
        
//         navigate('/payment/list');
//       }
//     } catch (error) {
//       showApiError(error);
//     }
//   };

//   return (
//     <div className="subscribe_container">
//       <h2>Peak 플랜 구독</h2>

//       {/* 1. 안내문구 박스 */}
//       <div className="info_guide_box">
//         <div className="guide_title">
//           <span className="guide_icon">📢</span>
//           <strong>안내</strong>
//         </div>
//         <ul className="guide_list">
//           <li>크루를 생성하기 위해서는 Peak 플랜을 구매하셔야 합니다.</li>
//           <li>구독이 만료되어도 기존에 생성하신 크루는 사라지지 않습니다.</li>
//         </ul>
//       </div>

//       {/* 2. 남은 시간 실시간 표시 박스 */}
//       <div className="timer_status_box">
//         <h3>현재 이용 중인 Peak 플랜</h3>
//         <div className="timer_display">
//           <span className="clock_icon">⏱️</span>
//           <span className="time_text">{timeLeftStr}</span>
//         </div>
//       </div>

//       {/* 3. Peak 플랜 상품 선택 리스트 */}
//       <div className="plan_section">
//         <h3>플랜 선택</h3>
//         <div className="plan_cards">
//           {/* 1주일 플랜 */}
//           <div
//             className={`plan_card ${selectedPlan === 'WEEK' ? 'active' : ''}`}
//             onClick={() => setSelectedPlan('WEEK')}
//           >
//             <div className="plan_header">
//               <span className="badge">체험형</span>
//               <h4>1주일</h4>
//             </div>
//             <div className="plan_price">
//               <strong>1,500</strong>원
//             </div>
//             <p className="plan_desc">7일간 크루 생성 가능</p>
//           </div>

//           {/* 1개월 플랜 */}
//           <div
//             className={`plan_card ${selectedPlan === 'MONTH' ? 'active' : ''}`}
//             onClick={() => setSelectedPlan('MONTH')}
//           >
//             <div className="plan_header">
//               <span className="badge popular">인기</span>
//               <h4>1개월</h4>
//             </div>
//             <div className="plan_price">
//               <strong>4,900</strong>원
//             </div>
//             <p className="plan_desc">30일간 크루 생성 가능</p>
//           </div>

//           {/* 1년 플랜 */}
//           <div
//             className={`plan_card ${selectedPlan === 'YEAR' ? 'active' : ''}`}
//             onClick={() => setSelectedPlan('YEAR')}
//           >
//             <div className="plan_header">
//               <span className="badge discount">BEST</span>
//               <h4>1년</h4>
//             </div>
//             <div className="plan_price">
//               <strong>55,000</strong>원
//             </div>
//             <p className="plan_desc">365일간 자유롭게 크루 생성</p>
//           </div>
//         </div>
//       </div>

//       {/* 4. 결제 수단 및 결제하기 영역 */}
//       <div className="subscribe_payment_box">
//         <div className="select_payment_type">
//           <label htmlFor="paymentType">결제 수단 선택</label>
//           <select
//             id="paymentType"
//             value={paymentType}
//             onChange={(e) => setPaymentType(e.target.value)}
//           >
//             <option value="">결제 수단을 선택하세요</option>
//             <option value="ACCOUNT">계좌이체</option>
//             <option value="CARD">신용/체크카드</option>
//             <option value="KAKAO">카카오페이</option>
//             <option value="TOSS">토스페이</option>
//           </select>
//         </div>

//         <button className="btn_subscribe_submit" onClick={handlePayment}>
//           Peak 플랜 결제하기
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MySubscribe;



import React from 'react'

const MySubscribe = () => {
  return (
    <>
      구독권 페이지
    </>
  )
}

export default MySubscribe