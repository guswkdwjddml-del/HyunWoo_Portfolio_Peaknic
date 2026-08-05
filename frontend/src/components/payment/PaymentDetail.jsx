import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import "../../css/payment/paymentDetail.css";
import { paymentDetail } from '../../store/slice/paymentSlice';
import { formatDateTime, showApiError, showCancelFn, showConfirmFn, showReviewFn } from '../../utils/commonModule';
import ActiveCrewTime from '../common/ActiveCrewTime';
import CrewThumbnail from '../common/CrewThumbnail';

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

// 결제 수단 한글로 바꾸기
const paymentTypeInfo = {
  ACCOUNT: { text: "계좌" },
  CARD: { text: "카드" },
  KAKAO: { text: "카카오페이" },
  // TOSS: { text: "토스페이" }
};

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

const PaymentDetail = () => { // yein 작성

  const { orderNumber } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux Store에서 데이터 가져오기
  const { paymentDetailItem: detail, loading: detailLoading, error: detailError } = useSelector(state => state.payment);

  // 결제 상세 내역 불러오기
  useEffect(() => {
    const loadPaymentDetailFn = async () => {
      try {
        await dispatch(paymentDetail(orderNumber)).unwrap();
      } catch (error) {
        showApiError(error);
      }
    }
    loadPaymentDetailFn();
  }, [dispatch, orderNumber])

  // 로딩 처리
  if (detailLoading) return <div className="paymentDetail-loading">결제 상세 내역을 불러오고 있습니다...</div>

  // 에러 처리
  if (detailError) {
    return (
      <div className="paymentDetail-error">
        <p>{detailError}</p>
        <button onClick={async () => {
          try {
            await dispatch(paymentDetail(orderNumber)).unwrap();
          } catch (error) {
            showApiError(error);
          }
        }}>다시 시도하기</button>
      </div>
    )
  }

  // 결제 상세 내역 비어있을 때
  if (!detail) {
    return (
      <div className="paymentDetail-empty">
        <p>결제 상세 내역이 없습니다.</p>
        <button onClick={() => navigate(`/payment/list`)}>결제 내역</button>
        <button onClick={() => navigate(`/crew`)}>크루 둘러보기</button>
      </div>
    )
  }

  // 결제 상태 한글로 바꾸기, 상태별 css 적용
  const paymentStatus = paymentStatusInfo[detail.paymentStatus];

  // 결제 수단 한글로 바꾸기
  const paymentType = paymentTypeInfo[detail.paymentType];

  return (
    <div className="paymentDetail">
      <div className="paymentDetail-con">

        <h2>결제 상세 내역</h2>

        <div className="paymentDetail-box">
          <div className="paymentDetail-top">
            <div className="pd-top-left">
              {detail.paymentType == "KAKAO"
                ? <p>{formatDateTime(detail.updateTime)} 주문</p>
                : <p>{formatDateTime(detail.createTime)} 주문</p>}
            </div>

            <div className="pd-top-right">
              <p>주문번호: {detail.orderNumber}</p>
            </div>
          </div>

          <div className="paymentDetail-payment">
            {/* RefundStatus가 NONE이 아니면 환불완료/환불실패 띄우고, NONE이면 PaymentStatus */}
            <div className={`pd-p-paymentStatus ${paymentStatus.className}`}>
              {paymentStatus.text}
            </div>

            <div className="pd-p-paymentType">
              <p>{paymentType.text} 결제</p>
            </div>

            <div className="pd-p-totalPrice">
              <p>{detail.totalPrice.toLocaleString()}원</p>
            </div>
          </div>

          <div className="paymentDetail-map">
            {/* 결제 상세 내역 출력 */}
            {detail.paymentItemDtos.map(item => {

              // 환불 상태 한글로 바꾸기
              const refundStatus = refundStatusInfo[item.refundStatus];

              return (
                <div key={item.id} className="paymentDetail-map-con"
                  onClick={() => navigate(`/crew/${item.crewId}`)}>

                  <div className="pdm-left">
                    {/* 크루 이미지 / 산 api 이미지 / 없으면 기본 이미지 */}
                    <CrewThumbnail crew={item} />

                    {/* 환불 상태 표시 */}
                    {refundStatus && (
                      <div className={`pdm-refund`}>
                        {refundStatus.text}
                      </div>
                    )}
                  </div>

                  <div className="pdm-center">
                    <div className="pdm-center-top">
                      <p>{item.crewName}</p>
                    </div>

                    <div className="pdm-center-bottom">
                      <div className="pdm-center-bottom-top">
                        <div className="pdm-center-bottom-mountainName">
                          <p>⛰️ {item.mountainName}</p>
                        </div>

                        {item.meetingPlace?.trim() && (
                          <div className="pdm-center-bottom-meetingPlace">
                            <p>📍 {item.meetingPlace}</p>
                          </div>
                        )}
                      </div>

                      <div className="pdm-center-bottom-crewDate">
                        <p>🕒 {formatDateTime(item.crewStartDate)} ~ {formatDateTime(item.crewEndDate)} {ActiveCrewTime(item.crewStartDate, item.crewEndDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pdm-right">
                    {/* 참여 확정 조건 만족하는지 확인 후 참여 확정 버튼 출력 */}
                    {showConfirmFn(
                      item.crewEndDate,
                      item.crewStatus,
                      item.participationConfirmed
                    )
                      && (
                        <div className="pdm-confirm">
                          <button className="pdm-confirm-btn"
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
                        <div className="pdm-review">
                          <button className='pdm-review-btn'
                            onClick={(e) => {
                              e.stopPropagation();
                              // 이전:/board/review-> /review로 변경 했습니다 혹시 실행 오류 발생시 말씀해주세요! 0721_sue
                              navigate(`/review`);
                            }}
                          >리뷰쓰기</button>
                        </div>
                      )}

                    <p>{item.currentPrice.toLocaleString()}원</p>

                    {/* 참여 취소 조건 만족하는지 확인 후 참여 취소 버튼 출력 */}
                    {showCancelFn(
                      item.crewStartDate,
                      item.crewStatus,
                      item.refundStatus
                    )
                      && (
                        <div className="pdm-cancel">
                          <button className='pdm-cancel-btn'
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/crew/${item.crewId}`)
                            }}
                          >참여취소</button>
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetail