// ====================   산 정보 검색시 이미지 호출    ===================== //

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from "react-router-dom"; // 🌟 navigate, location용 추가
import { useSelector } from 'react-redux';

const MountainImg = ({ mountain, imageUrl, mountainName, id, disableLink = false }) => {
  const defaultImage = '/images/mountain/no_image.png';
  const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태 관리
  
  const navigate = useNavigate(); 
  const location = useLocation();

  // 로그인 여부 확인 (Redux state 또는 localStorage 토큰 확인)
  const isLoggedIn = useSelector(state => state.auth?.isLoggedIn) || !!localStorage.getItem('accessToken');

  // 이미지 렌더링 우선순위 로직적용
  let displayImage = defaultImage;

  if (mountain?.newFileName) {
    // 1순위: 관리자가 직접 업로드한 파일이 있는 경우 (MountainFileEntity 연동)
    displayImage = `${encodeURIComponent(mountain.newFileName)}`;
  } else if (mountain?.imageUrl || imageUrl) {
    // 2순위: API에서 가져온 기존 imageUrl이 있는 경우
    displayImage = mountain?.imageUrl || imageUrl;
  }

  const displayName = (mountain?.mountainName || mountainName);
  const displayId = (mountain?.id || id);

   // 컴포넌트가 처음 화면에 뜰 때 북마크 정보를 백엔드에 요청합니다.
   useEffect(() => {
    // 북마크 상태 가져오기 (로그인한 유저인 경우에만)
    if (isLoggedIn) {
      axios.get(`/api/bookmarks/mountain/${displayId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
        .then(res => setIsBookmarked(res.data.isBookmarked)) 
        .catch(err => console.error("북마크 조회 실패:", err));
    }
  }, [isLoggedIn, displayId]); // 🌟 displayId 의존성 추가

  // 🌟 북마크 버튼 클릭 핸들러 (이벤트 객체 e 추가)
  const handleBookmark = async (e) => {
    e.preventDefault();  // 🌟 Link 컴포넌트의 기본 이동 동작을 막습니다.
    e.stopPropagation(); // 🌟 상위 요소(Link)로 클릭 이벤트가 전파되는 것을 완벽히 차단합니다.

    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/auth/login', { state: { returnUrl: location.pathname } });
      return;
    }

    try {
      // 북마크 토글 API 호출
      await axios.post(`/api/bookmarks/mountain/${displayId}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });

      setIsBookmarked(!isBookmarked); // UI 즉시 반영 (낙관적 업데이트)
    } catch (error) {
      console.error("북마크 처리 실패:", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className='mt-img-wrap'>
      <div className="mt-img-box">
        <img src={displayImage} alt={displayName || "산 이미지"} onError={(e) => { e.target.src = defaultImage; }}/>
      </div>
      <div className="mt-toolbar-box">
        <p>자세히보기 →</p>
        {isLoggedIn && (
          <button className={`btn-bookmark ${isBookmarked ? 'active' : ''}`} onClick={handleBookmark}></button>
        )}
      </div>
    </div>
  );
};

export default MountainImg;