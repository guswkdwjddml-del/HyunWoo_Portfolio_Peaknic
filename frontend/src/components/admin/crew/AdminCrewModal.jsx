import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { formatDateTime } from '../../../utils/commonModule';

const AdminCrewModal = ({ crewId, crewInfo, crewListFn, onClose }) => {

  // 1. adminCrewDto 초기 상태 설정
  const [crew, setCrew] = useState({
    crewName: "",
    crewPrice: "",
    crewPeople: "",
    currentPeople: "",
    crewDeadline: "",
    crewStartDate: "",
    memberId: "",
    mountainName: "",
    crewDetail: "",
    crewStatus: "",
  });

  useEffect(() => {
    if (crewInfo) {
      setCrew(crewInfo);
    } else {
      setCrew({
        crewName: "",
        crewPrice: "",
        crewPeople: "",
        currentPeople: "",
        crewDeadline: "",
        crewStartDate: "",
        memberId: "",
        mountainName: "",
        crewDetail: "",
        crewStatus: "",
      });
    }

    // crewId가 있으면 최신 상세 정보로 갱신
    if (crewId) {
      axios.get(`/api/crews/${crewId}`)
        .then(res => {
          setCrew(res.data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [crewId, crewInfo]);

  // 2. 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCrew((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const crewUpdateFn = async () => {
    try {
      await axios.put(`/admin/crew/${crewId}`, crew);
      alert("크루정보가 수정되었습니다.");

      console.log(crew);
      onClose();
      crewListFn();
    } catch (error) {
      console.error(error);
    }
  }

  const crewDeleteFn = async () => {

    if (!window.confirm("정말 이 크루을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(`/admin/crew/${crewId}`);
      alert("크루상품이 삭제되었습니다.");
      onClose();
      crewListFn();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="crewModal" onClick={onClose}>
      <div
        className="crewModal-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="crewModal-header">
          <h2>크루 상세</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="crewModal-body">
          <label className="crewInfo-label">아이디</label>
          <div className="crewInfo-text">{crew.id || ""}</div>
          <label className='crewInfo-label'>크루명</label>
          <div className="crewInfo-text">{crew.crewName || ""}</div>
          <label className='crewInfo-label'>참가비</label>
          <div className="crewInfo-text">{crew.crewPrice || ""}</div>
          <label className='crewInfo-label'>크루소개</label>
          <div className="crewInfo-textArea">
            {crew.crewDetail || ""}
          </div>
          <label className='crewInfo-label'>모집인원</label>
          <div className="crewInfo-text">{crew.crewPeople || ""}</div>
          <label className='crewInfo-label'>참여인원</label>
          <div className="crewInfo-text">{crew.currentPeople || ""}</div>
          <label className='crewInfo-label'>모집마감일</label>
          <div className="crewInfo-text">{formatDateTime(crew.crewDeadline) || ""}</div>
          <label className='crewInfo-label'>크루시작일</label>
          <div className="crewInfo-text">{formatDateTime(crew.crewStartDate) || ""}</div>
          <label className='crewInfo-label'>크루장(ID)</label>
          <div className="crewInfo-text">{crew.memberId || ""}</div>
          <label className='crewInfo-label'>산이름</label>
          <div className="crewInfo-text">{crew.mountainName || ""}</div>
          <label className='crewInfo-label'>크루상태</label>
          <select
            name="crewStatus"
            value={crew.crewStatus || ""}
            onChange={handleChange}
          >
            <option value="RECRUITING">모집중</option>
            <option value="CLOSED">마감</option>
            <option value="COMPLETED">완료</option>
            <option value="DELETED">삭제</option>
            <option value="CANCELED">취소(모집실패)</option>
          </select>
        </div>
        <div className="crewModal-footer">
          <button onClick={crewUpdateFn}>수정</button>
          <button onClick={crewDeleteFn}>삭제</button>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}

export default AdminCrewModal
