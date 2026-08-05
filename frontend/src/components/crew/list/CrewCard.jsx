import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { IconCalendar, IconCheck, IconMountain, IconUsers } from "../common/CrewIcons";
import { fetchCrewParticipants } from "../../../store/slice/crewSlice";
import { getCrewStatusInfo } from "../common/CrewUtils";
import "../../../css/crew/crewCommon.css"; // 공통 CSS 임포트

// 이미지 기본값 및 API URL 설정
const NO_IMAGE = "/images/mountain/no_image.png";

// 개별 크루 카드를 렌더링하고, 각각 참여자 API를 호출하여 상태 관리 (React.memo를 감싸서 부모의검색어 입력시 발생하는 불필요한 리렌더링 차단)
const CrewCard = React.memo(({ crew, currentUserEmail }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch(); // crewSlice 디스패치용
  // 참여자목록 가져오기 (crewSlice)
  const EMPTY_ARRAY = [];
  const participants = useSelector(state => state.crew.participantsByCrew[crew.id] ?? EMPTY_ARRAY);  // crewSlice 참여자배열 가져오기
  const [localParticipants, setLocalParticipants] = useState([]); // redux비어있을경우 대비 로컬상태
  const finalParticipants = participants.length > 0 ? participants : localParticipants;
  // 공통 모듈에서 계산된 상태값들 가져오기
  const statusInfo = getCrewStatusInfo(crew, participants, currentUserEmail);
  const { isBlind, isJoined, host, currentPeople, isDeleted, isCancelled, isCompleted, label, className, topLabel } = statusInfo;

  // 참여자 목록 API 호출 (백엔드 QueryDsl활용, crewSlice Thunk액션 디스패치)
  useEffect(() => {
    dispatch(fetchCrewParticipants(crew.id));
  }, [dispatch, crew.id]);

  // 썸네일 이미지 처리
  // 1순위-유저가올린이미지, 2순위-관리자가업로드한 산 이미지, 3순위-api이미지, 4순위-없음
  let displayImage = NO_IMAGE;
  if (crew.crewFiles && crew.crewFiles.length > 0) {
    displayImage = `${crew.crewFiles[0].filePath}`;
  } else if (crew.mountainNewFileName) {
    displayImage = `${encodeURIComponent(crew.mountainNewFileName)}`;
  } else if (crew.mountainImageUrl) {
    displayImage = crew.mountainImageUrl;
  }

  // 방장 프로필 이미지 경로 가져오기
  let profileImg = "/images/profile_default_1.png";
  if (host && host.newFileName) {
    if (host.newFileName.startsWith("/images/")) {
      profileImg = `${host.newFileName}`;
    } else {
      profileImg = `${host.newFileName}`;
    }
  }

  return (
    <div className={`modern-crew-card ${isBlind ? 'closed' : ''}`} onClick={() => navigate(`/crew/${crew.id}`)}>
      {isBlind && (<div className="mc-closed-label">{topLabel}</div>)}

      <div className="mc-image-wrapper">
        <img src={displayImage} alt={crew.crewName} onError={(e) => e.target.src = NO_IMAGE} />

        <div className="mc-badges">
          {/* 통일된 클래스와 레이블 적용 */}
          <span className={`mc-status ${className}`}>  {isJoined && !isDeleted && !isCancelled ? (<><IconCheck />참여중</>) : (label)}  </span>
          <span className={`mc-level level-${crew.crewLevel === "초보" ? "1" : crew.crewLevel === "중급" ? "2" : "3"}`}>  {crew.crewLevel || "초보"}  </span>
        </div>
      </div>

      <div className="mc-body">
        <h3 className="mc-title">{crew.crewName}</h3>

        <div className="mc-host-info">
          <img src={profileImg} alt="방장" onError={(e) => { e.target.onerror = null; e.target.src = "/images/profile_default_1.png"; }} />
          <span>방장: {host ? host.userName : (crew.memberName || "알 수 없음")}</span>
        </div>

        <div className="mc-info-list">
          <p><IconMountain /> <span>{crew.mountainName || "자유 코스"}</span></p>
          <p><IconCalendar /> <span>{crew.crewStartDate ? crew.crewStartDate.replace("T", " ").substring(0, 16) + " 출발" : "일정 미정"}</span></p>
          <p className="highlight-people"><IconUsers /> <span>{Math.max(participants.length, crew.currentPeople || 0)} / {crew.crewPeople}명 참여중</span></p>
        </div>

        <div className="mc-tags">
          {crew.tags ? (
            crew.tags.split(",").filter(Boolean).slice(0, 3).map((tag) => (
              <span key={tag.trim()} className="mc-tag">#{tag.trim()}</span>
            ))
          ) : (
            <span className="mc-tag empty">등록된 태그 없음</span>
          )}
        </div>

        <div className="mc-footer">
          <span className="mc-price">{crew.crewPrice === 0 ? "무료" : `${crew.crewPrice.toLocaleString()}원`}</span>
          <span className="mc-deadline">마감: {crew.crewDeadline ? crew.crewDeadline.split("T")[0] : "미정"}</span>
        </div>
      </div>
    </div>
  );
});

export default CrewCard;
