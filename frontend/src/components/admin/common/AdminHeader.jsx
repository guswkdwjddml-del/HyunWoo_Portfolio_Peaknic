import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { loginF, logoutF } from '../../../store/slice/authSlice';
import axios from 'axios';

const AdminHeader = ({ setMenuOpen }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 💡 Redux store 상태 구조 확인
  const { isState, isUser, expireTime } = useSelector((state) => state.auth);

  // 💡 남은 시간을 '분:초' 스트링으로 관리할 상태
  const [timeLeft, setTimeLeft] = useState("00:00");

  // 🌟 토큰에서 디코딩해온 프로필 이미지 경로를 저장할 로컬 상태 추가
  const [profileImgPath, setProfileImgPath] = useState("");

  // 🌟 accessToken을 디코딩하여 profileImg 추출하기
  useEffect(() => {
    if (isState) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // 토큰 속 payload의 profileImg 주입 ("member/xxxx.png" 혹은 "images/xxxx.png")
          if (decoded.profileImg) {
            setProfileImgPath(decoded.profileImg);
          } else {
            setProfileImgPath("");
          }
        } catch (error) {
          console.error("헤더 토큰 디코딩 실패:", error);
          setProfileImgPath("");
        }
      }
    } else {
      setProfileImgPath("");
    }
  }, [isState, expireTime]); // 로그인 상태나 토큰 연장(갱신) 시마다 재추출

  // 💡 [수정] 정밀화된 실시간 타이머 및 자동 로그아웃 처리
  useEffect(() => {
    // 로그인 상태가 아니거나 expireTime이 없으면 타이머를 돌리지 않음
    if (!isState || !expireTime) {
      return;
    }

    let timerId;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const targetTime = Number(expireTime);
      const difference = targetTime - now;

      // ⚠️ [핵심 방어 코드 1] 계산 결과가 숫자가 아니거나(NaN), 
      // 만료시간 수치가 비정상적으로 작은 경우(예: 0 또는 이전 쓰레기 데이터) 즉시 로그아웃되는 것을 차단
      if (isNaN(difference) || targetTime < 1000000000000) {
        console.log("[Timer 방어] 비정상적인 expireTime 감지 - 로그아웃을 일시 유예합니다.");
        setTimeLeft("00:00");
        return;
      }

      // ⚠️ [핵심 방어 코드 2] 로그인 직후 순간적으로 음수가 찍히는 동기화 에러 방어
      // 남은 밀리초가 0 이하일 때, '진짜 만료'인지 확인하기 위해 -5초(5000ms) 정도의 유예 대기 시간을 둡니다.
      if (difference <= -5000) {
        console.warn("[Timer 만료] 로그인 세션 수명이 완전히 다 되어 자동 로그아웃합니다.");
        if (timerId) clearInterval(timerId);

        dispatch(logoutF());
        delete axios.defaults.headers.common['Authorization'];
        alert("로그인 세션이 만료되어 자동 로그아웃 되었습니다.");
        navigate("/");
        return;
      } else if (difference <= 0) {
        // 시간이 딱 정각이거나 아주 미세하게 지나가고 있을 때는 00:00으로 표시하며 대기
        setTimeLeft("00:00");
        return;
      }

      // ⏰ 정상적인 분/초 계산 규칙
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const minutesStr = String(minutes).padStart(2, "0");
      const secondsStr = String(seconds).padStart(2, "0");

      setTimeLeft(`${minutesStr}분 ${secondsStr}초`);
    };

    // 마운트 시점에 로컬스토리지와 리덕스가 완전히 안착할 수 있도록 100ms 가량 아주 미세한 유예를 두고 시작합니다.
    const delayId = setTimeout(() => {
      calculateTimeLeft();
      timerId = setInterval(calculateTimeLeft, 1000);
    }, 100);

    return () => {
      clearTimeout(delayId);
      if (timerId) clearInterval(timerId);
    };
  }, [isState, expireTime, dispatch, navigate]);

  // 💡 [수정] 시간 연장 (Token Refresh) 처리 함수
  const handleRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const userEmail = localStorage.getItem("userEmail") || isUser?.userEmail;

      if (!refreshToken) {
        alert("인증 정보가 없습니다. 다시 로그인해 주세요.");
        return;
      }

      console.log("[Refresh] 토큰 연장 요청 시작...", { userEmail, refreshToken });

      // 백엔드 /api/member/refresh 호출
      const response = await axios.post(`/api/member/refresh`, {
        refreshToken: refreshToken,
        userEmail: userEmail
      });

      if (response.status === 200) {
        const { accessToken, refreshToken: newRefreshToken, accessTokenExpirationTime, userName, role } = response.data;

        // 1. 로컬스토리지 토큰 갱신
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        // 2. Axios 공통 헤더 교체
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 3. ⭐ 리덕스 authSlice 스펙과 정확히 일치하도록 페이로드 가공하여 디스패치
        const newExpireTime = new Date().getTime() + Number(accessTokenExpirationTime);

        console.log("[Refresh] 연장 성공! 새 만료 시간 밀리초:", newExpireTime);

        dispatch(loginF({
          isUser: {
            userEmail: userEmail || isUser?.userEmail,
            userName: userName || isUser?.userName,
            role: role || isUser?.role
          },
          expireTime: newExpireTime
        }));

        alert("로그인 시간이 연장되었습니다.");
      }
    } catch (error) {
      console.error("시간 연장 실패:", error);
      alert("세션 연장에 실패했습니다. 다시 로그인 해주세요.");
      handleLogout();
    }
  };

  // ⭐ 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await axios.post(`/api/member/logout`);
    } catch (error) {
      console.error("백엔드 로그아웃 처리 중 에러 발생:", error);
    } finally {
      dispatch(logoutF());
      delete axios.defaults.headers.common['Authorization'];
      alert(`로그아웃 되었습니다.`);
      navigate("/");
    }
  };

  return (
    <div className="adminHeader">
      <div className="adminHeader-wrap">
        <div className="log_layout">
          <div className="log_tab_wrap">
            {/* 마우스 호버의 기준점이 될 메인 레이아웃 (프로필 정보 영역) */}
            <div className="log_tab_main">
              <div className="header_user_profile">
                <div className="header_avatar_circle">
                <img
                  src={
                    !profileImgPath
                      ? "/images/profile_default_1.png"
                      : profileImgPath.startsWith("http")
                      ? profileImgPath
                      : profileImgPath.startsWith("images/")
                      ? `/${profileImgPath}`
                      : `${profileImgPath}`
                  }
                  alt="Profile"
                  className="header_avatar_img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/profile_default_1.png";
                  }}
                />
                </div>
                <span className="header_username_span">
                  <strong>{isUser?.userName || "회원"}</strong>님
                </span>
              </div>
            </div>

            {/* 마우스 호버 시 아래로 펼쳐질 드롭다운 메뉴 (리스트화 완료) */}
            <div className="log_tab_menu">
              <ul className="dropdown_list">
                <li className="dropdown_item">
                  <Link to={`/mypage`} className="nav_btn_com nav_logout_btn">
                    <span className="ico ico14"></span>
                    <span>마이페이지</span>
                  </Link>
                </li>
                <li className="dropdown_item">
                  <button onClick={handleLogout} className="nav_btn_com nav_logout_btn">
                    <span className="ico ico13"></span>
                    <span>로그아웃</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="header_timer_box">
            <i className="icons"></i>
            <span className="timer_text">
              {timeLeft}
            </span>
            <button onClick={handleRefresh} className="nav_refresh_btn">
              연장
            </button>
          </div>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          ☰
        </button>

      </div>
    </div>
  )
}

export default AdminHeader
