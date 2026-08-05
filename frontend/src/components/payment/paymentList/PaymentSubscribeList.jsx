import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "../../../css/payment/paymentSubscribeList.css";
import { subscribeList } from '../../../store/slice/subscribeSlice';
import { formatDateTime, paymentHiddenFn } from '../../../utils/commonModule';
import Pagination from '../../../utils/Pagination';

// 구독 상태 한글로 바꾸기, 상태별 css 적용
const subscribeStatusInfo = {
  READY: { text: "결제 대기", className: "status-ready" },
  ACTIVE: { text: "구독 중", className: "status-finish" },
  EXPIRED: { text: "구독 만료", className: "status-expired" },
  CANCELLED: { text: "구독 취소/실패", className: "status-failed" }
};

// 결제 수단 한글로 바꾸기
const paymentTypeInfo = {
  ACCOUNT: { text: "계좌" },
  CARD: { text: "카드" },
  KAKAO: { text: "카카오페이" },
  // TOSS: { text: "토스페이" }
};

const PaymentSubscribeList = () => { // yein 작성

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Store에서 데이터 가져오기
  const { subscribeItem, totalPages, listLoading, listError } = useSelector(state => state.subscribe);

  // 결제내역 페이징
  const [page, setPage] = useState(0);
  // 선택한 구독 내역 아이디 -> 드롭다운 (결제상세보기/결제내역삭제)
  const [openMenuId, setOpenMenuId] = useState(null);

  // 결제 내역 불러오기
  useEffect(() => {
    const loadSubscribeFn = async () => {
      try {
        await dispatch(subscribeList(page)).unwrap();
      } catch (error) {
        showApiError(error);
      }
    }
    loadSubscribeFn();
  }, [dispatch, page])

  // 로딩 처리
  if (listLoading && subscribeItem.length === 0) return <div className="subscribeList-loading">플랜 결제 내역을 불러오고 있습니다...</div>

  // 에러 처리
  if (listError) {
    <div className="subscribeList-error">
      <p>{listError}</p>
      <button onClick={async () => {
        try {
          await dispatch(subscribeList(page)).unwrap();
        } catch (error) {
          showApiError(error);
        }
      }}>다시 시도하기</button>
    </div>
  }

  // 구독 결제 내역 비었을 때
  if (!subscribeItem || subscribeItem.length === 0) {
    return (
      <div className="payment-empty">
        <p>구독 결제 내역이 없습니다.</p>
        <button onClick={() => navigate(`/subscribe/plan`)}>플랜 둘러보기</button>
      </div>
    )
  }

  return (
    <div className="paymentSubscribe">
      <div className="paymentSubscribe-con">
        <div className="paymentSubscribe-map">
          {subscribeItem.map(sub => {
            // 구독 상태 한글로 바꾸기, 상태별 css 적용
            const subscribeStatus = subscribeStatusInfo[sub.subscribeStatus];

            // 결제 수단 한글로 바꾸기
            const paymentType = paymentTypeInfo[sub.paymentType];

            return (
              <div key={sub.id} className="paymentSubscribe-map-con">
                <div className="ps-top">
                  <div className="ps-createTime">{formatDateTime(sub.createTime)}</div>
                  <div className="ps-header">
                    <div className={`ps-paymentStatus ${subscribeStatus.className}`}>{subscribeStatus.text}</div>

                    <div className="ps-totalPrice"><p>{sub.price.toLocaleString()}원</p></div>

                    <div className="ps-menu">
                      <button className='ps-menu-btn'
                        onClick={(e) => {
                          e.stopPropagation();
                          // 메뉴 드롭다운 열려있으면 닫고, 닫혀있으면 열기
                          setOpenMenuId(openMenuId === sub.id ? null : sub.id);
                        }}
                      >···</button>

                      {openMenuId === sub.id && (
                        <div className="ps-menu-dropdown">
                          <button onClick={(e) => paymentHiddenFn({ e, paymentId: sub.paymentId, dispatch, listThunk: subscribeList, page })}>결제 내역 삭제</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ps-bottom">
                  <div className="ps-item">
                    <div className="ps-center">
                      <div className="ps-center-crewName">
                        <p>{sub.subscribeType} 플랜</p>
                      </div>
                      <div className="ps-center-info">
                        <div className="ps-center-orderNumber">
                          <p>주문번호: {sub.orderNumber}</p>
                        </div>

                        <div className="ps-paymentType">
                          <p>{paymentType.text} 결제</p>
                        </div>
                      </div>
                    </div>

                    <div className="ps-right">
                      {sub.subscribeStatus === "ACTIVE" && (
                        <p className="ps-subscribe-period">
                          {formatDateTime(sub.subscribeStartTime)} ~ {formatDateTime(sub.subscribeExpireTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}

export default PaymentSubscribeList