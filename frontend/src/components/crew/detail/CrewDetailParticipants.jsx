import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "../../../css/crew/crewDetailParticipants.css"


// crewDetail 에서 참여자 목록 및 메뉴드롭다운 기능 담당 컴포넌트
const CrewDetailParticipants = ({ crewId, crewPeople, hostId, currentUserEmail }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // 모달 관련 상태
  const [modalType, setModalType] = useState(null); // 'CREW' | 'REVIEW' | null
  const [modalData, setModalData] = useState([]);
  const [modalUser, setModalUser] = useState("");
  const [selectedProfileUser, setSelectedProfileUser] = useState(null); // 상대방 프로필 모달용 데이터
  const [isModalLoading, setIsModalLoading] = useState(false);


  // 백엔드에서 참여자목록 가져오기
  useEffect(() => {
    if (!crewId) return;
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(`/api/crews/${crewId}/participants`);
        setParticipants(response.data);
      } catch (error) {
        console.error("참여자 목록 불러오기 실패:", error);
      }
    };
    fetchParticipants();
  }, [crewId]);


  // 화면의 다른 곳을 클릭했을 때 열려있는 드롭다운 메뉴닫기 (편의성)
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 프로필 아바타 클릭 시 해당 유저의 드롭다운 메뉴를 열거나 닫습니다.
  const handleAvatarClick = (e, memberId) => {
    e.stopPropagation(); // 화면 밖 클릭 감지(handleClickOutside)가 즉시 실행되지 않도록 막아줍니다.
    setActiveDropdown(prev => prev === memberId ? null : memberId);
  };

  // 총 모집 인원에서 현재 참여자 수를 빼서 빈 자리(모집중) 박스 개수를 계산합니다.
  const emptySlots = Math.max(0, crewPeople - participants.length);

  // 개설한 크루 데이터 가져오기 (모달)
  const openCrewModal = async (memberId, userName) => {
    setActiveDropdown(null);
    setModalType('CREW');
    setModalUser(userName);
    setIsModalLoading(true);
    try {
      const res = await axios.get(`/api/crews/search`, { params: { memberId, size: 20 } });
      setModalData(res.data.content || []);
    } catch (error) {
      console.error(error);
      alert("크루 목록을 불러오지 못했습니다.");
    } finally {
      setIsModalLoading(false);
    }
  };

  // 작성한 리뷰 데이터 가져오기 (모달)
  const openReviewModal = async (memberId, userName) => {
    setActiveDropdown(null);
    setModalType('REVIEW');
    setModalUser(userName);
    setIsModalLoading(true);
    try {
      const res = await axios.get(`/api/board`, { params: { category: 'REVIEW', memberId, size: 20 } });
      setModalData(res.data.content || []);
    } catch (error) {
      console.error(error);
      alert("리뷰 목록을 불러오지 못했습니다.");
    } finally {
      setIsModalLoading(false);
    }
  };

  // 상대방의 프로필 정보(자기소개, 하이킹 레벨 등) 모달
  const openProfileModal = (participant) => {
    setActiveDropdown(null);
    setModalType('PROFILE');
    setSelectedProfileUser(participant);
  };

  return (
    <div className="cd-section">
      <h3>참여자 목록 ({participants.length}/{crewPeople})</h3>
      <div className="cd-participants-list">

        {/* 백엔드에서 받아온 참여자(방장 포함) 리스트를 순회하며 화면에 그립니다. */}
        {participants.map((p) => {
          const isHost = p.id === hostId; // 현재 렌더링 중인 유저가 방장인지 확인 (참여자,방장 화면다르게 보여줘야함)
          // 현재 로그인한 유저와 목록의 유저가 같은지 판별 (이메일 기준)
          const isMe = p.userEmail === currentUserEmail;
          // 프로필 이미지 경로 분기 처리 로직 (DB 저장 방식에 맞춤)
          let profileImg = "/images/profile_default_1.png";
          if (p.newFileName) {
            if (p.newFileName.startsWith("/images")) {
              profileImg = `${p.newFileName}`; // public 폴더의 기본 이미지
            } else {
              profileImg = `${p.newFileName}`; // 유저가 직접 업로드한 이미지
            }
          }
          return (
            // 겹침방지 'active-dropdown' 클래스 부여
            <div key={p.id} className={`participant-item ${isHost ? 'host' : ''} ${activeDropdown === p.id ? 'active-dropdown' : ''}`}>
              <div className="p-avatar" onClick={(e) => handleAvatarClick(e, p.id)}>
                <img src={profileImg} alt="프로필" onError={(e) => { e.target.onerror = null; e.target.src = "/images/profile_default_1.png" }} />

                {/* activeDropdown 값과 현재 유저 ID가 같을 때만 드롭다운 메뉴를 보여줍니다. */}
                {activeDropdown === p.id && (
                  <div className="user-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <p className="drop-name">{p.userName}</p>
                      <p className="drop-level">등산 레벨: Lv.{p.hikingLevel || 1}</p>
                    </div>

                    <hr className="drop-divider" />

                    {/* 부가 기능 버튼 (나 vs 상대방) */}
                    <div className="dropdown-btn-group">
                      {isMe ? (
                        <>
                          <button className="dropdown-btn" onClick={() => navigate(`/mypage`)}>마이페이지</button>
                          <button className="dropdown-btn" onClick={() => openCrewModal(p.id, p.userName)}>내 크루</button>
                          <button className="dropdown-btn" onClick={() => openReviewModal(p.id, p.userName)}>내 리뷰</button>
                        </>
                      ) : (
                        <>
                          <button className="dropdown-btn" onClick={() => openProfileModal(p)}>프로필 보기</button>
                          <button className="dropdown-btn" onClick={() => openCrewModal(p.id, p.userName)}>개설한 크루</button>
                          <button className="dropdown-btn" onClick={() => openReviewModal(p.id, p.userName)}>작성한 리뷰</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-text-col">
                <span className="p-name">{p.userName}</span>
                <span className="p-role">{isHost ? '방장 (참여중)' : '참가확정 (참여중)'}</span>
              </div>
            </div>
          );
        })}

        {/* 아직 참여하지 않은 빈 자리를 배열로 만들어 채워줍니다. */}
        {[...Array(emptySlots)].map((_, i) => (
          <div key={`empty-${i}`} className="participant-item empty">
            <div className="p-avatar" >+</div>
            <div className="p-text-col">
              <span className="p-name">모집중</span>
            </div>
          </div>
        ))}


        {/* 크루 목록 또는 산행 리뷰 모달 */}
        {(modalType === 'CREW' || modalType === 'REVIEW') && (
          <div className="history-modal-overlay" onClick={() => setModalType(null)}>
            <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>

              <div className="hm-header">
                <h3>{modalUser}님의 {modalType === 'CREW' ? '크루 목록' : '산행 리뷰'}</h3>
                <button className="hm-close-btn" onClick={() => setModalType(null)}>&times;</button>
              </div>

              <div className="hm-body">
                {isModalLoading ? (
                  <div className="hm-empty">데이터를 불러오는 중입니다...</div>
                ) : modalData.length === 0 ? (
                  <div className="hm-empty">등록된 내역이 없습니다.</div>
                ) : (
                  modalData.map(data => {
                    const isCrew = modalType === 'CREW';
                    const targetId = data.id;
                    const title = isCrew ? data.crewName : data.title;
                    const desc = isCrew ? `📍 ${data.mountainName || '자유코스'}` : data.content;
                    const dateStr = isCrew ? data.crewStartDate?.substring(0, 10) : data.createTime?.substring(0, 10);

                    let thumbSrc = "/images/mountain/no_image.png";
                    if (isCrew) {
                      if (data.crewFiles?.length > 0) thumbSrc = `${data.crewFiles[0].filePath}`;
                      else if (data.mountainImageUrl) thumbSrc = data.mountainImageUrl;
                    } else {
                      if (data.newFileNames?.length > 0) thumbSrc = `/upload/board/${data.newFileNames[0]}`;
                    }

                    return (
                      <div
                        key={targetId}
                        className="hm-card"
                        onClick={() => {
                          setModalType(null);
                          isCrew ? navigate(`/crew/${targetId}`) : navigate(`/board/detail/${targetId}`);
                        }}
                      >
                        <img src={thumbSrc} alt="썸네일" className="hm-thumb" onError={(e) => e.target.src = "/images/mountain/no_image.png"} />
                        <div className="hm-info">
                          <p className="hm-title">{title}</p>
                          <p className="hm-desc">{desc}</p>
                          <span className="hm-date">{dateStr}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        )}

        {/* 프로필 모달 (독립 분리) */}
        {modalType === 'PROFILE' && selectedProfileUser && (
          <div
            onClick={() => setModalType(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 99999
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '360px',
                textAlign: 'center',
                padding: '24px',
                background: '#fff',
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div className="hm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedProfileUser.userName}님의 프로필</h3>
                <button className="hm-close-btn" onClick={() => setModalType(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}>&times;</button>
              </div>
              <div className="hm-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#5aa933' }}>
                  등산 레벨: Lv.{selectedProfileUser.hikingLevel || 1}
                </div>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px', minHeight: '80px', fontSize: '14px', color: '#333' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#666' }}>자기소개</p>
                  {selectedProfileUser.memberDetail || "등록된 자기소개가 없습니다."}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


export default CrewDetailParticipants