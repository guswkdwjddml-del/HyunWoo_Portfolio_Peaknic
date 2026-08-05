import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "../../../css/payment/paymentCrewList.css";
import { paymentConfirmParticipation, paymentList } from '../../../store/slice/paymentSlice';
import { formatDateTime, paymentHiddenFn, showApiError, showConfirmFn, showReviewFn } from '../../../utils/commonModule';
import Pagination from '../../../utils/Pagination';
import CrewThumbnail from '../../common/CrewThumbnail';

// 결제 상태 한글로 바꾸기, 상태별 css 적용
const paymentStatusInfo = {
  READY: {
    text: "결제 대기", className: "status-ready"
  },
  FINISH: {
    text: "결제 완료", className: "status-finish"
  },
  FAILED: {
    text: "결제 실패", className: "status-failed"
  },
  EXPIRED: {
    text: "결제 만료", className: "status-expired"
  }
};

// 환불 상태 한글로 바꾸기
const refundStatusInfo = {
  REFUND: {
    text: "환불 완료"
  },
  REFUND_FAILED: {
    text: "환불 실패"
  }
}

const PaymentList = () => { // yein 작성

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Store에서 데이터 가져오기
  const { paymentItem, totalPages, loading: paymentLoading, error: paymentError } = useSelector(state => state.payment);

  // 결제내역 페이징
  const [page, setPage] = useState(0);
  // 선택한 결제 내역 아이디 -> 드롭다운 (결제상세보기/결제내역삭제)
  const [openMenuId, setOpenMenuId] = useState(null);
  // 선택한 결제 내역 펼치기
  const [openPaymentItems, setOpenPaymentItems] = useState([]);

  // 결제 내역 불러오기
  useEffect(() => {
    const loadPaymentFn = async () => {
      try {
        await dispatch(paymentList(page)).unwrap();
      } catch (error) {
        showApiError(error);
      }
    }
    loadPaymentFn();
  }, [dispatch, page])

  // 참여 확정
  const confirmParticipationFn = async (e, paymentItemId) => {
    e.stopPropagation();

    if (!confirm("참여를 확정하시겠습니까? 확정 후에는 취소할 수 없습니다.")) return;

    try {
      const result = await dispatch(paymentConfirmParticipation(paymentItemId)).unwrap();
      alert(result.message);
    } catch (error) {
      showApiError(error);
    }
  }

  // 선택한 결제 내역 펼치기/접기
  const openPaymentItemFn = (paymentId) => {
    setOpenPaymentItems(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]);
  }

  // 로딩 처리
  if (paymentLoading && paymentItem.length === 0) return <div className="payment-loading">결제 내역을 불러오고 있습니다...</div>

  // 에러 처리
  if (paymentError) {
    return (
      <div className="payment-error">
        <p>{paymentError}</p>
        <button onClick={async () => {
          try {
            await dispatch(paymentList()).unwrap();
          } catch (error) {
            showApiError(error);
          }
        }}>다시 시도하기</button>
      </div>
    )
  }

  // 결제 내역 비어있을 때
  if (paymentItem.length === 0) {
    return (
      <div className="payment-empty">
        <p>크루 결제 내역이 없습니다.</p>
        <button onClick={() => navigate(`/cart/list`)}>장바구니</button>
        <button onClick={() => navigate(`/crew`)}>크루 둘러보기</button>
      </div>
    )
  }

  return (
    <div className="paymentList">
      <div className="paymentList-con">
        <div className="paymentList-map">
          {/* 결제 내역 출력 */}
          {paymentItem.map(payment => {
            // 결제 상태 한글로 바꾸기, 상태별 css 적용
            const status = paymentStatusInfo[payment.paymentStatus];

            // 환불 상태 한글로 바꾸기
            const refundStatus = refundStatusInfo[payment.paymentItemDtos[0].refundStatus];

            return (
              <div key={payment.id} className="paymentList-map-con">
                <div className="pl-top">
                  <div className="pl-createTime">
                    {formatDateTime(payment.createTime)}
                  </div>

                  <div className="pl-header">
                    <div className={`pl-paymentStatus ${status.className}`}>
                      {status.text}
                    </div>

                    <div className="pl-totalPrice">
                      {payment.totalPrice.toLocaleString()}원
                    </div>

                    <div className="pl-menu">
                      <button className='pl-menu-btn'
                        onClick={(e) => {
                          e.stopPropagation();
                          // 메뉴 드롭다운 열려있으면 닫고, 닫혀있으면 열기
                          setOpenMenuId(openMenuId === payment.id ? null : payment.id);
                        }}
                      >···</button>

                      {openMenuId === payment.id && (
                        <div className="pl-menu-dropdown">
                          <button onClick={() => navigate(`/payment/detail/${payment.orderNumber}`)}>결제 상세 보기</button>
                          <button onClick={(e) => paymentHiddenFn({ e, paymentId: payment.id, dispatch, listThunk: paymentList, page })}>결제 내역 삭제</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pl-bottom">
                  {!openPaymentItems.includes(payment.id) ? (
                    <>
                      {/* 결제 내역 접었을 때*/}
                      <div className="pl-item"
                        onClick={() => navigate(`/crew/${payment.paymentItemDtos[0].crewId}`)}>
                        <div className="pl-left">
                          {/* 크루 이미지 / 산 api 이미지 / 없으면 기본 이미지 */}
                          <CrewThumbnail crew={payment.paymentItemDtos[0]} />

                          {/* 환불 상태 표시 */}
                          {refundStatus && (
                            <div className={`pl-refund`}>
                              {refundStatus.text}
                            </div>
                          )}
                        </div>

                        <div className="pl-center">
                          <div className="pl-center-crewName">
                            <p>{payment.paymentItemDtos[0].crewName}</p>
                          </div>

                          <div className="pl-center-mountainName">
                            <p>⛰️ {payment.paymentItemDtos[0].mountainName}</p>
                          </div>
                        </div>

                        <div className="pl-right">
                          {/* 참여 확정 조건 만족하는지 확인 후 참여 확정 버튼 출력 */}
                          {showConfirmFn(
                            payment.paymentItemDtos[0].crewEndDate,
                            payment.paymentItemDtos[0].crewStatus,
                            payment.paymentItemDtos[0].participationConfirmed
                          )
                            && (
                              <div className="pl-confirm">
                                <button className="pl-confirm-btn"
                                  onClick={(e) => confirmParticipationFn(e, payment.paymentItemDtos[0].id)}
                                >참여확정</button>
                              </div>
                            )}

                          {/* 리뷰 작성 조건 만족하는지 확인 후 리뷰 쓰기 버튼 출력 */}
                          {showReviewFn(
                            payment.paymentItemDtos[0].crewEndDate,
                            payment.paymentItemDtos[0].crewStatus,
                            payment.paymentItemDtos[0].reviewConfirmed
                          )
                            && (
                              <div className="pl-review">
                                <button className='pl-review-btn'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // 이전:/board/review-> /review로 변경 했습니다 혹시 실행 오류 발생시 말씀해주세요! 0721_sue
                                    navigate(`/review/write`);
                                  }}
                                >리뷰쓰기</button>
                              </div>
                            )}

                          <p>{payment.paymentItemDtos[0].currentPrice.toLocaleString()}원</p>
                        </div>
                      </div>

                      {payment.paymentItemDtos.length > 1 && (
                        <button className="pl-more-btn"
                          onClick={() => openPaymentItemFn(payment.id)}
                        >외 {payment.paymentItemDtos.length - 1}건 ▼</button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* 결제 내역 펼쳤을 때 */}
                      <div className="pl-item-list">
                        {payment.paymentItemDtos.map(item => {

                          // 환불 상태 한글로 바꾸기
                          const refundStatus = refundStatusInfo[item.refundStatus];

                          return (
                            <div key={item.id} className="pl-item"
                              onClick={() => navigate(`/crew/${item.crewId}`)}>
                              <div className="pl-left">
                                {/* 크루 이미지 / 없으면 기본 이미지 */}
                                <CrewThumbnail crew={item} />

                                {/* 환불 상태 표시 */}
                                {refundStatus && (
                                  <div className="pl-refund">
                                    {refundStatus.text}
                                  </div>
                                )}
                              </div>

                              <div className="pl-center">
                                <div className="pl-center-crewName">
                                  <p>{item.crewName}</p>
                                </div>

                                <div className="pl-center-mountainName">
                                  <p>⛰️ {item.mountainName}</p>
                                </div>
                              </div>

                              <div className="pl-right">
                                {/* 참여 확정 조건 만족하는지 확인 후 참여 확정 버튼 출력 */}
                                {showConfirmFn(
                                  item.crewEndDate,
                                  item.crewStatus,
                                  item.participationConfirmed
                                )
                                  && (
                                    <div className="pl-confirm">
                                      <button className="pl-confirm-btn"
                                        onClick={(e) => confirmParticipationFn(e, item.id)}
                                      >참여확정</button>
                                    </div>
                                  )}

                                {/* 리뷰 작성 조건 만족하는지 확인 후 리뷰 쓰기 버튼 출력 */}
                                {showReviewFn(
                                  item.crewEndDate,
                                  item.crewStatus,
                                  item.reviewConfirmed
                                )
                                  && (
                                    <div className="pl-review">
                                      <button className='pl-review-btn'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // 이전:/board/review-> /review로 변경 했습니다 혹시 실행 오류 발생시 말씀해주세요! 0721_sue
                                          navigate(`/review`);
                                        }}
                                      >리뷰쓰기</button>
                                    </div>
                                  )}

                                <p>{item.currentPrice.toLocaleString()}원</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <button className="pl-more-btn"
                        onClick={() => openPaymentItemFn(payment.id)}
                      >▲ 접기</button>
                    </>
                  )}

                </div>

              </div>
            )
          })}
        </div>

        <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />

      </div>
    </div>
  )
}

export default PaymentList