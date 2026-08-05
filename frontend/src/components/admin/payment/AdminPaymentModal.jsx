import React, { useEffect, useState } from 'react'
import { formatDateTime } from '../../../utils/commonModule';

const paymentTypeMap = {
  ACCOUNT: "계좌이체",
  CARD: "신용/체크카드",
  KAKAO: "카카오페이",
  // TOSS: "토스페이",
};

const paymentStatusMap = {
  READY: "결제대기",
  FINISH: "결제완료",
  REFUND_REQUEST: "환불요청",
  REFUND: "환불완료",
};

const paymentCategoryMap = {
  CREW: "크루",
  SUBSCRIBE: "구독권",
};

const subscribeTypeMap = {
  WEEK: "1주일(1,500원)",
  MONTH: "1개월(4,900원)",
  YEAR: "1년(55,000원)",
};

const subscribeStatusMap = {
  READY: "결제대기",
  ACTIVE: "구독중",
  EXPIRED: "만료",
  CANCELLED: "결제취소",
};

const AdminPaymentModal = ({ paymentId, paymentInfo, paymentListFn, onClose }) => {

  const [payment, setPayment] = useState({
    id: "",
    paymentCategory: "",
    totalPrice: "",
    paymentType: "",
    paymentStatus: "",
    memberId: "",
    paymentItems: [],
    subscribeInfo: null,
    orderNumber: "",
  })

  useEffect(() => {
    if (paymentInfo) {
      setPayment(paymentInfo);
    } else {
      setPayment({
        id: "",
        paymentCategory: "",
        totalPrice: "",
        paymentType: "",
        paymentStatus: "",
        memberId: "",
        paymentItems: [],
        subscribeInfo: null,
        orderNumber: "",
      });
    }
  }, [paymentInfo]);

  // 2. 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='paymentModal' onClick={onClose}>
      <div
        className="paymentModal-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="paymentModal-header">
          <h2>결제 상세</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="paymentModal-body">
          <div className="paymentInfo_label">아이디</div>
          <input
            type="text"
            value={payment.id}
            readOnly
            className='paymentInfo'
          />
          <div className="paymentInfo_label">항목구분</div>
          <input
            type="text"
            value={paymentCategoryMap[payment.paymentCategory] ?? payment.paymentCategory}
            readOnly
            className='paymentInfo'
          />
          <div className="paymentInfo_label">결제금액</div>
          <input
            type="text"
            value={payment.totalPrice.toLocaleString()}
            readOnly
            className='paymentInfo'
          />
          <div className="paymentInfo_label">결제방법</div>
          <input
            type="text"
            value={paymentTypeMap[payment.paymentType] ?? payment.paymentType}
            onChange={handleChange}
            className='paymentInfo'
          />
          <div className="paymentInfo_label">결제상태</div>
          <input
            type="text"
            value={paymentStatusMap[payment.paymentStatus] ?? payment.paymentStatus}
            onChange={handleChange}
            className='paymentInfo'
          />
          <div className="paymentInfo_label">결제자(ID)</div>
          <input
            type="text"
            value={payment.memberId}
            readOnly
            className='paymentInfo'
          />
          <div className="paymentInfo_label">주문번호</div>
          <input
            type="text"
            value={payment.orderNumber}
            readOnly
            className='paymentInfo'
          />
          <div className="paymentInfo_label">결제일시</div>
          <input
            type="text"
            value={formatDateTime(payment.createTime)}
            readOnly
            className='paymentInfo'
          />

          <div className="paymentInfo_label">세부항목</div>

          {/* 크루 결제 상세 */}
          {
            payment.paymentCategory === "CREW" && (

              <div className="paymentItemList">

                {payment.paymentItems?.length > 0 ? (

                  payment.paymentItems.map((item, index) => (

                    <div className="paymentItemCard" key={item.id}>

                      <div className="paymentItemHeader">
                        <span>항목 {index + 1}</span>
                      </div>


                      <div className="paymentItemBody">

                        <div>
                          <span>크루명</span>
                          <p>{item.crewName}</p>
                        </div>


                        <div>
                          <span>산이름</span>
                          <p>{item.mountainName}</p>
                        </div>


                        <div>
                          <span>참가비</span>
                          <p>
                            {item.currentPrice?.toLocaleString()}원
                          </p>
                        </div>


                        <div>
                          <span>출발일</span>
                          <p>
                            {formatDateTime(item.crewStartDate)}
                          </p>
                        </div>

                      </div>

                    </div>

                  ))

                ) : (

                  <p>결제 항목이 없습니다.</p>

                )}

              </div>

            )
          }



          {/* 구독권 결제 상세 */}
          {
            payment.paymentCategory === "SUBSCRIBE" &&
            payment.subscribeInfo && (

              <div className="paymentItemList">

                <div className="paymentItemCard">


                  <div className="paymentItemHeader">
                    <span>구독권 정보</span>
                  </div>


                  <div className="paymentItemBody">


                    <div>
                      <span>구독 종류</span>
                      <p>
                        {
                          subscribeTypeMap[
                          payment.subscribeInfo.subscribeType
                          ]
                          ??
                          payment.subscribeInfo.subscribeType
                        }
                      </p>
                    </div>


                    <div>
                      <span>구독 가격</span>
                      <p>
                        {payment.subscribeInfo.price?.toLocaleString()}원
                      </p>
                    </div>


                    <div>
                      <span>구독 상태</span>
                      <p>
                        {
                          subscribeStatusMap[
                          payment.subscribeInfo.subscribeStatus
                          ]
                          ??
                          payment.subscribeInfo.subscribeStatus
                        }
                      </p>
                    </div>


                    <div>
                      <span>구독 시작일</span>
                      <p>
                        {formatDateTime(
                          payment.subscribeInfo.subscribeStartTime
                        )}
                      </p>
                    </div>


                    <div>
                      <span>구독 만료일</span>
                      <p>
                        {formatDateTime(
                          payment.subscribeInfo.subscribeExpireTime
                        )}
                      </p>
                    </div>


                  </div>


                </div>


              </div>

            )
          }
        </div>
        <div className="paymentModal-footer">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}

export default AdminPaymentModal
