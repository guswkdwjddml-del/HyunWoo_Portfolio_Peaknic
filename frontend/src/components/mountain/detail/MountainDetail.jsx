import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MountainImg from '../MountainImg';
import MountainCourseList from './MountainCourseList';
import MountainReviewList from './MountainReviewList';
import '../../../css/mountain/mountainDetail.css';
import MountainReviewWrite from './MountainReviewWrite';
import { useSelector } from 'react-redux';


const MountainDetail = () => {
  // 주소창에서 산의 id 값을 가져옵니다.
  const { id } = useParams();
  // 백엔드에서 받아온 산 정보를 저장할 상태입니다.
  const [mountain, setMountain] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태 관리

  // 로그인 여부 확인 (Redux state 또는 localStorage 토큰 확인)
  const isLoggedIn = useSelector(state => state.auth?.isLoggedIn) || !!localStorage.getItem('accessToken');

  // 컴포넌트가 처음 화면에 뜰 때 산 정보를 백엔드에 요청합니다.
  useEffect(() => {
    const mountainId = Number(id);

    // 산 기본 정보 가져오기
    axios.get(`/api/mountains/${mountainId}`)
      .then(res => setMountain(res.data))
      .catch(err => console.error(err));

    // 북마크 상태 가져오기 (로그인한 유저인 경우에만)
    if (isLoggedIn) {
      axios.get(`/api/bookmarks/mountain/${mountainId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      })
        .then(res => setIsBookmarked(res.data.isBookmarked)) // 백엔드 응답에 맞게 수정 필요
        .catch(err => console.error("북마크 조회 실패:", err));
    }
  }, [id, isLoggedIn]);

  // 북마크 버튼 클릭 핸들러
  const handleBookmark = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/auth/login', { state: { returnUrl: location.pathname } });
      return;
    }

    try {
      // 북마크 토글 API 호출 (백엔드 설계에 따라 POST/DELETE 등으로 변경 가능)
      await axios.post(`/api/bookmarks/mountain/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });

      setIsBookmarked(!isBookmarked); // UI 즉시 반영 (낙관적 업데이트)
    } catch (error) {
      console.error("북마크 처리 실패:", error);
      alert("북마크 처리 중 오류가 발생했습니다.");
    }
  };



  // 데이터 로딩 전 처리
  if (!mountain) return <div>로딩 중...</div>;

  // 조립된 컴포넌트들을 화면에 렌더링합니다.
  return (
    <div className="mountain-detail-wrap">
      <div className="mountain-detail-container">
        <div className="mountain-info-box">
          <div className="mountain-detail-image-left">
            <MountainImg  mountain={mountain} disableLink={true}/>
          </div>
          <div className="mountain-detail-text-right">
            <ul>
              <li>
                <h2 className="mountain-name">{mountain.mountainName}</h2>
              </li>
              <li>
                <span>위치</span>
                <p className="mountain-location">{mountain.location}</p>
              </li>
              <li>
                <span>높이</span>
                <p className="mountain-height">{mountain.height}</p>
              </li>
              <li>
                <span>상세설명</span>
                <p className="mountain-desc">{mountain.description}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. 등산로 코스 목록 및 크루 생성 분기 (분리됨) */}
        <MountainCourseList mountainId={mountain.id} mountainName={mountain?.mountainName} />

        {/* 4. 산 리뷰 게시글 (분리됨) */}
        <MountainReviewList mountainId={id} mountainName={mountain.mountainName} />

        {/* 5. 테스트용 리뷰쓰기 (나중에 주석처리하거나 삭제) */}
        {/* <MountainReviewWrite mountainId={mountain.id} /> */}

      </div>
    </div>
  );
};

export default MountainDetail;