import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "../../css/cart/cartList.css";
import { cartDelete, cartListPrint, removeCartItem } from '../../store/slice/cartSlice';
import { paymentInsert } from '../../store/slice/paymentSlice';
import { formatDateTime, showApiError } from '../../utils/commonModule';
import ActiveCrewTime from '../common/ActiveCrewTime';
import CrewThumbnail from '../common/CrewThumbnail';

// 결제 방법
const PAYMENT_TYPES = [
  { value: "ACCOUNT", label: "계좌" },
  { value: "CARD", label: "카드" },
  { value: "KAKAO", label: "카카오페이" },
  // { value: "TOSS", label: "토스페이" },
];

// 크루 상태 한국어로 변경 -> CLOSED(마감)/COMPLETED(완료)/DELETED(삭제)/CANCELLED(취소)
const changeCrewStatusFn = (status) => {
  switch (status) {
    case "CLOSED":
      return "모집 마감된 크루입니다.";
    case "COMPLETED":
      return "활동이 완료된 크루입니다.";
    case "DELETED":
      return "삭제된 크루입니다.";
    case "CANCELLED":
      return "모집이 취소된 크루입니다.";
    default:
      return "";
  }
}

// 크루 마감 날짜까지 얼마나 남았는지 구하기
const deadlineLeftFn = (deadline) => {
  // deadline 값이 없으면 공백 return
  if (!deadline) return "";

  // 현재 시간 기준으로 마감까지 얼마나 남았는지 계산 (ms 단위)
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  // 마감
  if (diff <= 0) return "(마감)";

  // 총 몇분/몇시간인지 계산
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));

  // 며칠 몇시간 몇분 남았는지 계산
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days >= 1) {
    // 1일 이상
    if (hours === 0) return `(${days}일 남음)`;
    return `(${days}일 ${hours}시간 남음)`;
  } else if (totalHours >= 1) {
    // 24시간 미만
    if (minutes === 0) return `(${hours}시간 남음)`;
    return `(${hours}시간 ${minutes}분 남음)`;
  } else {
    // 60분 미만
    return `(${minutes}분 남음)`;
  }
}

const cartList = () => { // yein 작성

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Store에서 데이터 가져오기
  const { cartItem, loading: cartLoading, error: cartError } = useSelector(state => state.cart);

  // 선택한 장바구니 아이템 아이디 -> 비회원은 크루 아이디
  const [selectIds, setSelectIds] = useState([]);
  // 선택한 결제 방법
  const [paymentType, setPaymentType] = useState("");

  // 장바구니 아이템 전체 선택  
  const allCheckCartItemFn = () => {
    // 전체 선택 상태면 해제, 아니면 전체 선택
    if (selectIds.length === cartItem.length) {
      setSelectIds([]);
    } else {
      setSelectIds(cartItem.map(item => item.id ?? item.crewId));
    }
  }

  // 장바구니 아이템 삭제  
  const deleteCartItemFn = async () => {
    // 삭제 취소시 종료
    if (!confirm("정말 장바구니 아이템을 삭제하시겠습니까?")) {
      return;
    }

    // 회원 / 비회원 정보 가져오기
    const accessToken = localStorage.getItem("accessToken");
    const guestId = localStorage.getItem("guestId");

    try {
      const result = await dispatch(cartDelete({ accessToken, guestId, selectIds })).unwrap();
      alert(result.message);
      setSelectIds([]); // 선택한 장바구니 아이템 초기화
    } catch (error) {
      showApiError(error);
    }
  }

  // 장바구니 아이템 체크  
  const checkCartItemFn = (id) => {
    // 체크 상태 변경
    setSelectIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]);
  }

  // 총 결제 금액 계산  
  const totalPriceFn = () => {
    return cartItem
      .filter(item => selectIds.includes(item.id ?? item.crewId))
      .reduce((sum, item) => sum + item.crewPrice, 0);
  }

  // 결제하기  
  const goToPaymentFn = async () => {
    // 크루 체크박스 미선택시 결제 불가
    if (selectIds.length === 0) {
      alert("결제할 크루를 선택해주세요");
      return;
    }

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
      const result = await dispatch(paymentInsert({ selectIds, paymentType })).unwrap();

      if (result.redirectUrl) {
        // 카카오페이 -> 결제창으로 이동 => 장바구니 정리는 승인 완료 후 진행
        window.location.href = result.redirectUrl;
      } else {
        // 일반 결제 -> 결제 내역으로 이동
        alert(result.message);
        dispatch(removeCartItem(selectIds));  // 결제한 장바구니 아이템 삭제
        setSelectIds([]);                     // 선택한 장바구니 아이템 초기화
        navigate(`/payment/list?tab=CREW`);
      }
    } catch (error) {
      showApiError(error);
    }
  }

  // 로딩 처리
  if (cartLoading && cartItem.length === 0) return <div className="cart-loading">장바구니 내역을 불러오고 있습니다...</div>

  // 에러 처리
  if (cartError) {
    // 회원 / 비회원 정보 가져오기
    const accessToken = localStorage.getItem("accessToken");
    const guestId = localStorage.getItem("guestId");
    return (
      <div className="cart-error">
        <p>{cartError}</p>
        <button onClick={async () => {
          try {
            await dispatch(cartListPrint({ accessToken, guestId })).unwrap();
          } catch (error) {
            showApiError(error);
          }
        }}>다시 시도하기</button>
      </div>
    )
  }

  // 장바구니 비어있을 때
  if (cartItem.length === 0) {
    return (
      <div className="cart-empty">
        <p>장바구니가 비어있습니다.</p>
        <button onClick={() => navigate('/crew')}>크루 둘러보기</button>
      </div>
    )
  }

  return (
    <div className="cartList">
      <div className="cartList-con">

        <h2>장바구니</h2>

        <div className="cartList-header">
          {/* 장바구니 아이템 전체 선택/해제 */}
          <label className="allCheck">
            <input type="checkbox"
              checked={
                cartItem.length > 0 &&
                selectIds.length === cartItem.length
              }
              onChange={allCheckCartItemFn} />
            <span>전체 선택</span>
          </label>

          {/* 장바구니 아이템 삭제 */}
          <div className="cartList-delete">
            {selectIds.length > 0 && (
              <button onClick={deleteCartItemFn}>삭제하기 ({selectIds.length})</button>
            )}
          </div>
        </div>

        <div className="cartList-map">
          {/* 장바구니 아이템 출력 */}
          {cartItem.map(item => {

            // 장바구니 리스트 출력시 비회원이면 itemId가 없으므로 crewId 사용
            const itemId = item.id ?? item.crewId;

            return (
              <div key={itemId} className="cartList-map-con"
                onClick={() => navigate(`/crew/${item.crewId}`)}>

                {/* 크루 상태가 CLOSED(마감)/COMPLETED(완료)/DELETED(삭제)/CANCELLED(취소)면 오버레이 덮어씌우기 */}
                {["CLOSED", "COMPLETED", "DELETED", "CANCELLED"].includes(item.crewStatus) && (
                  <div className="crewOverlay">
                    {changeCrewStatusFn(item.crewStatus)}
                  </div>
                )}

                <input type="checkbox" name={`checkCartItem-${itemId}`} id={`checkCartItem-${itemId}`}
                  checked={selectIds.includes(itemId)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => checkCartItemFn(itemId)} />

                <div className="left">
                  {/* 크루 이미지 / 산 api 이미지 / 없으면 기본 이미지 */}
                  <CrewThumbnail crew={item} />
                </div>

                <div className="center">
                  <div className="center-top">
                    <p>{item.crewName}</p>
                    <p>신청 마감일: {formatDateTime(item.crewDeadline)} {deadlineLeftFn(item.crewDeadline)}</p>
                  </div>
                  <div className="center-bottom">
                    <p>⛰️ {item.mountainName}</p>
                    {item.meetingPlace?.trim() && (
                      <p>📍 {item.meetingPlace}</p>
                    )}
                    <p>🕒 {formatDateTime(item.crewStartDate)} ~ {formatDateTime(item.crewEndDate)} {ActiveCrewTime(item.crewStartDate, item.crewEndDate)}</p>
                  </div>
                </div>

                <div className="right">
                  <div className="right-top">
                    <p>{item.crewPrice}원</p>
                  </div>
                  <div className="right-bottom">
                    <p>{item.currentPeople}</p>
                    <span>/</span>
                    <p>{item.crewPeople}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="cartList-totalPrice">
          <p>선택한 크루: {selectIds.length}개</p>
          <strong>{totalPriceFn().toLocaleString()}원</strong>
        </div>

        <div className="cartList-payment">
          <select name="paymentType" id="paymentType"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}>
            <option value="">결제 방법 선택</option>
            {PAYMENT_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>

          <button onClick={goToPaymentFn}>결제하기</button>
        </div>

      </div>
    </div>
  )
}

export default cartList