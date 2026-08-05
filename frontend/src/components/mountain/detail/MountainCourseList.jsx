import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// 산의 등산로 코스 목록을 조회하고 크루 생성 분기(선택후 크루생성이동)를 처리
const MountainCourseList = ({ mountainId, mountainName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 산 ID를 기반으로 백엔드에서 코스 목록을 가져옵니다.
  useEffect(() => {
    if (mountainId) {
      axios.get(`/api/trails/mountain/${mountainId}`)
        .then(res => setCourses(res.data))
        .catch(err => console.error("코스 목록 호출 에러:", err));
    }
  }, [mountainId]);

  // 코스 선택 후 크루 생성 페이지로 넘어가는 권한 검증 및 라우팅을 수행합니다.
  const handleCreateCrew = (course) => {
    const hasToken = localStorage.getItem('accessToken') || localStorage.getItem('token');

    if (!isLoggedIn && !hasToken) {
      alert("로그인이 필요한 서비스입니다.");
      navigate('/auth/login', { state: { returnUrl: location.pathname } });
      return;
    }

    navigate('/crew/create', {
      state: {
        mountainId: mountainId,
        predefinedMountain: mountainName,
        courseType: 'CUSTOM',
        courseData: course
      }
    });
  };

  return (
    <div className="mountain-course-section">
      <h3 className="section-title">등산로 코스</h3>

      <div className="course-list">
        {courses.length === 0 ? (
          <p className="empty-message">등록된 코스가 없습니다.</p>
        ) : (
          courses.map(course => (
            <div key={course.trailId} className={`course-card ${selectedCourse?.trailId === course.trailId ? 'active' : ''}`}>
              <div className="course-info">
                <h4 className="course-title">{course.courseName} <span className="difficulty-badge">{course.difficulty || '보통'}</span></h4>
                <p className="course-meta">거리: {course.totalLength?.toFixed(1)}km &nbsp;|&nbsp; 소요시간: {course.estimatedTime}분</p>
              </div>

              <button className="btn-select-course" onClick={() => handleCreateCrew(course)}>
                크루 만들기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MountainCourseList;