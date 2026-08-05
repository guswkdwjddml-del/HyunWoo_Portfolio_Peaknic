import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDateTime } from '../../utils/commonModule';


const Dashboard = () => {
  const navigate = useNavigate();

  // 대시보드 통합 상태 관리
  const [profile, setProfile] = useState({
    memberDetail: '',
    hikingLevel: 1,
    previewUrl: '/images/profile_default_1.png',
  });
  const [notifications, setNotifications] = useState([]);
  const [myCrews, setMyCrews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        // 0. 사용자 memberId 조회
        let memberId = null;
        if (token) {
          try {
            const idRes = await axios.get(`/api/member/findId`, { headers });
            memberId = idRes.data?.memberId || idRes.data?.id || idRes.data;
          } catch (e) {
            console.error('memberId 조회 실패:', e);
          }
        }

        // 1. 프로필 정보 요청
        const profileRes = await axios.get(`/api/member/profile`, { headers });
        if (profileRes.status === 200) {
          const { memberDetail, hikingLevel, newFileName } = profileRes.data;

          // newFileName 값이 없으면 기본 이미지 경로 할당
          const previewUrl = newFileName || '/images/profile_default_1.png';

          setProfile({
            memberDetail: memberDetail || '등록된 자기소개가 없습니다.',
            hikingLevel: hikingLevel || 1,
            previewUrl,
          });
        }

        // 2. 최근 알림 요청 (최신 5개)
        const notiRes = await axios.get(`/api/notification`, {
          headers,
          params: { page: 0, size: 5 },
        });
        const safeNotis = (notiRes.data.content || []).map((n) => ({
          ...n,
          isRead: n.read !== undefined ? n.read : n.isRead,
        }));
        setNotifications(safeNotis);

        // 3. 내가 참여한 크루 목록 요청
        const crewParams = {
          page: 0,
          size: 10,
          sort: 'id,desc',
          ...(memberId ? { memberId } : {}),
        };

        const crewRes = await axios.get(`/api/crews/myjoincrew`, {
          headers,
          params: crewParams,
        });

        const fetchedContent = crewRes.data.content || [];
        
        // 삭제된 모임(DELETED) 제외 후 상위 5개만 정제
        const validCrews = fetchedContent
          .filter((crew) => crew.crewStatus !== 'DELETED')
          .slice(0, 5);

        setMyCrews(validCrews);

      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="dashboard_loading">대시보드를 불러오는 중입니다...</div>;
  }

  return (
    <div className="dashboard_container">
      {/* 상단 2열 Grid */}
      <div className="dashboard_top_grid">
        {/* 1. 내 프로필 요약 카드 */}
        <div
          className="dash_card profile_summary_card"
          onClick={() => navigate('/mypage/profileChange')}
          title="클릭하여 프로필 수정 페이지로 이동"
        >
          <div className="card_header">
            <h3>내 프로필</h3>
            <span className="edit_badge">프로필 수정 ➔</span>
          </div>

          <div className="dash_profile_body">
            <div className="dash_avatar_box">
              <img 
                src={profile.previewUrl} 
                alt="내 프로필 이미지" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/profile_default_1.png';
                }}
              />
              <span className="level_tag">Lv.{profile.hikingLevel}</span>
            </div>
            <div className="dash_profile_info">
              <p className="dash_member_detail">{profile.memberDetail}</p>
              <div className="dash_level_bar_wrap">
                <span className="level_text">등산 레벨</span>
                <div className="level_stars">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <span
                      key={lvl}
                      className={`star ${lvl <= profile.hikingLevel ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 최근 알림 목록 */}
        <div className="dash_card noti_summary_card">
          <div className="card_header">
            <h3>최근 알림</h3>
            <button
              className="more_btn"
              onClick={() => navigate('/mypage/notification')}
            >
              전체보기 ➔
            </button>
          </div>

          <div className="dash_noti_body">
            {notifications.length === 0 ? (
              <p className="dash_empty">새로운 알림이 없습니다.</p>
            ) : (
              <ul className="dash_noti_list">
                {notifications.map((noti) => (
                  <li
                    key={noti.id}
                    className={`dash_noti_item ${noti.isRead ? 'read' : 'unread'}`}
                    onClick={() => navigate('/mypage/notification')}
                  >
                    {!noti.isRead && <span className="noti_badge">NEW</span>}
                    <span className="noti_title">[{noti.title}]</span>
                    <span className="noti_msg">{noti.message}</span>
                    <span className="noti_date">
                      {formatDateTime(noti.createTime)?.substring(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 3. 내가 참여한 크루 목록 */}
      <div className="dash_card crew_summary_card">
        <div className="card_header">
          <h3>참여중인 모임</h3>
          <button
            className="more_btn"
            onClick={() => navigate('/mypage/myJoinCrew')}
          >
            전체보기 ➔
          </button>
        </div>

        <div className="dash_crew_body">
          {myCrews.length === 0 ? (
            <p className="dash_empty">참여 중인 모임이 없습니다.</p>
          ) : (
            <div className="dash_table_wrapper">
              <table className="dash_board_table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>이미지</th>
                    <th>크루명</th>
                    <th>산 이름</th>
                    <th>출발 시간</th>
                    <th>참여 인원</th>
                    <th>마감 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {myCrews.map((crew) => {
                    let displayImage = '/images/mountain/no_image.png';
                    if (crew.crewFiles && crew.crewFiles.length > 0) {
                      displayImage = `${crew.crewFiles[0].filePath}`;
                    } else if (crew.mountainNewFileName) {
                      displayImage = `${encodeURIComponent(crew.mountainNewFileName)}`;
                    } else if (crew.mountainImageUrl) {
                      displayImage = crew.mountainImageUrl;
                    }

                    return (
                      <tr
                        key={crew.id}
                        className="dash_table_row"
                        onClick={() => navigate(`/crew/${crew.id}`)}
                      >
                        <td className="center_td">
                          <img
                            src={displayImage}
                            alt={crew.crewName}
                            className="dash_thumb_img"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/mountain/no_image.png';
                            }}
                          />
                        </td>
                        <td className="crew_title_td">
                          <strong className="crew_name_txt">{crew.crewName}</strong>
                        </td>
                        <td>{crew.mountainName || '자유 코스'}</td>
                        <td>{crew.crewStartDate?.replace('T', ' ')?.substring(0, 16)}</td>
                        <td className="center_td">
                          <span className="people_badge">
                            {crew.currentPeople} / {crew.crewPeople}명
                          </span>
                        </td>
                        <td className="center_td">
                          {crew.crewDeadline?.split('T')[0]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;