import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { formatDateTime } from '../../../utils/commonModule';

const AdminCrewSettlementModal = ({ crewId, crewSettleInfo, crewListFn, onClose }) => {

  const [settlement, setSettlement] = useState({
    id: "",
    crewName: "",
    userName: "",
    crewPrice: 0,
    currentPeople: 0,
    crewPeople: 0,

    settlementId: "",
    settlementStatus: "",
    totalAmount: 0,
    feeAmount: 0,
    payoutAmount: 0,
    completedTime: "",
  });

  // 전달받은 정산정보 state 저장
  useEffect(() => {
    if (crewSettleInfo) {
      setSettlement(crewSettleInfo);
    } else {
      setSettlement({
        id: "",
        crewName: "",
        userName: "",
        crewPrice: 0,
        currentPeople: 0,
        crewPeople: 0,

        settlementId: "",
        settlementStatus: "",
        totalAmount: 0,
        feeAmount: 0,
        payoutAmount: 0,
        completedTime: "",
      })
    }
  }, [crewSettleInfo]);

  if (!crewSettleInfo) {
    return null;
  }

  // 정산 상태 표시
  const settlementStatusMap = {
    PENDING: "정산대기",
    COMPLETED: "정산완료",
  };

  // 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettlement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 정산 처리
  const settlementCompleteFn = async () => {

    if (!window.confirm("결제금액 정산을 확정하시겠습니까?")) {
      return;
    }

    try {
      // 추후 구현
      await axios.post(`/admin/crew/settlement/${settlement.settlementId}`);

      alert("정산 완료 처리되었습니다.");

      const res = await axios.get(`/admin/crew/settlement/${crewId}`);
      setSettlement(res.data);
      // onClose();
      crewListFn();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="settlementModal" onClick={onClose}>
      <div
        className="settlementModal-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settlementModal-header">
          <h2>크루 정산 관리</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="settlementModal-body">
          {/* 크루 정보 */}
          <label className="settlementInfo-label crew-small">크루명(ID)</label>
          <div className="settlementInfo-text crew-small">{settlement.crewName || ""}({crewId || ""})</div>
          <label className="settlementInfo-label crew-small">크루장</label>
          <div className="settlementInfo-text crew-small">{settlement.userName || ""}</div>
          <label className="settlementInfo-label crew-small">참가비</label>
          <div className="settlementInfo-text crew-small">{settlement.crewPrice?.toLocaleString()}원</div>
          <label className="settlementInfo-label crew-small">참여인원</label>
          <div className="settlementInfo-text crew-small">{settlement.currentPeople}/{settlement.crewPeople}</div>
          <hr />

          {/* 정산 정보 */}
          <label className="settlementInfo-label">정산 아이디</label>
          <div className="settlementInfo-text">{settlement.settlementId || "-"}</div>
          <label className="settlementInfo-label">크루원 총 결제금액</label>
          <div className="settlementInfo-text">{settlement.totalAmount?.toLocaleString()}원</div>
          <label className="settlementInfo-label">크루장 지급금액(95%)</label>
          <div className="settlementInfo-text">{settlement.payoutAmount?.toLocaleString()}원</div>
          <label className="settlementInfo-label">수수료(5%)</label>
          <div className="settlementInfo-text">{settlement.feeAmount?.toLocaleString()}원</div>
          <label className="settlementInfo-label">정산상태</label>
          <div className="settlement-status-wrap">
            <div className="settlementInfo-text">{
              settlementStatusMap[settlement.settlementStatus]
              ??
              "정산정보 없음"
            }
            </div>
            <button
              className="settlementComplete-btn"
              disabled={
                !settlement.settlementStatus ||
                settlement.settlementStatus === "COMPLETED"
              }
              onClick={settlementCompleteFn}
            >
              정산하기
            </button>
          </div>
          <label className="settlementInfo-label">정산 완료일</label>
          <div className="settlementInfo-text">{formatDateTime(settlement.completedTime) || "-"}</div>
        </div>

        <div className="settlementModal-footer">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>

    </div>
  )
}

export default AdminCrewSettlementModal
