import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { logoutF } from "../../store/slice/authSlice";
import { cartListPrint, clearCart } from "../../store/slice/cartSlice";
import { clearSubscribe } from "../../store/slice/subscribeSlice";
import { showApiError } from "../../utils/commonModule";
import { refreshAccessToken } from "../../utils/refreshAccessToken";
import NotificationDropdown from "../notification/NotificationDropdown";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pageClass, setPageClass] = useState("");

  const navigate = useNavigate();
  const param = useParams();
  const location = useLocation();

  const dispatch = useDispatch();

  // 💡 Redux store 상태 구조 확인
  const { isState, isUser, expireTime } = useSelector((state) => state.auth);

  // yein - Redux Store에서 데이터 가져오기
  const { cartItem } = useSelector(state => state.cart);

  // 💡 남은 시간을 '분:초' 스트링으로 관리할 상태
  const [timeLeft, setTimeLeft] = useState("00:00");

  // 🌟 2. 토큰에서 디코딩해온 프로필 이미지 경로를 저장할 로컬 상태 추가
  const [profileImgPath, setProfileImgPath] = useState("");

  // 모바일 메뉴 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const [activeIndex, setActiveIndex] = useState(null);
  const handleTitleClick = (e, index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };


  // 🌟 3. 로그인 상태일 때 accessToken을 디코딩하여 profileImg 추출하기
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
  }, [isState, expireTime, isUser]); // 로그인 상태나 토큰 연장(갱신) 시마다 재추출



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

  // yein - 장바구니 불러오기
  useEffect(() => {
    const loadCartFn = async () => {
      // 회원 / 비회원 정보 가져오기
      const accessToken = localStorage.getItem("accessToken");
      const guestId = localStorage.getItem("guestId");

      // 둘 다 없으면 조회 안 함
      if (!accessToken && !guestId) return;

      try {
        await dispatch(cartListPrint({ accessToken, guestId })).unwrap();
      } catch (error) {
        showApiError(error);
      }
    }
    loadCartFn();
  }, [dispatch])

  // 💡 [수정] 시간 연장 (Token Refresh) 처리 함수
  const handleRefresh = async () => {
    try {
      // yein - 공통 함수화 -> 새 AccessToken 발급
      await refreshAccessToken(dispatch);
      alert("로그인 시간이 연장되었습니다.");
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
      // yein - 로그아웃시 장바구니/구독 Redux 초기화
      dispatch(clearCart());
      dispatch(clearSubscribe());
    } catch (error) {
      console.error("백엔드 로그아웃 처리 중 에러 발생:", error);
    } finally {
      dispatch(logoutF());
      delete axios.defaults.headers.common['Authorization'];
      alert(`로그아웃 되었습니다.`);
      // yein - 전 페이지로 이동하게 수정
      navigate("/");
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveIndex(null);
    setIsHovered(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
      setPageClass("");
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <>
      <div
        className={`header_wrap ${pageClass} ${isHovered ? "on" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <header className="header active">
          <div className="header_box">
            <nav className="nav">
              <ul>
                <li><NavLink to={`/mountain`}><span>등산로 찾기</span></NavLink></li>
                <li><NavLink to={`/crew`}><span>크루 찾기</span></NavLink></li>
                <li><NavLink to={`/review`}><span>크루 리뷰</span></NavLink></li>
                <li><NavLink to={`/board`}><span>커뮤니티</span></NavLink></li>
              </ul>
            </nav>
            <div className="header_left">
              <h1>
                <Link to={`/`}>logo</Link>
              </h1>
            </div>

            <div className="header_right">
              {isState ? (
                <>
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
                                  : profileImgPath.startsWith("/images")
                                  ? `${profileImgPath}`
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
                          

                          {/* yein - HOST면 왕관 추가 */}
                          {isUser?.role === "HOST" && (
                            <span className="host-crown">👑</span>
                          )}
                          <span className="header_username_span">
                            <strong>{isUser?.userName || "회원"}</strong>님
                          </span>
                        </div>
                      </div>

                      {/* 마우스 호버 시 아래로 펼쳐질 드롭다운 메뉴 (리스트화 완료) */}
                      <div className="log_tab_menu">
                        <ul className="dropdown_list">
                          {isState && isUser?.role === 'ADMIN' && (
                            <li className="dropdown_item dropdown_item2">
                              <Link to={`/admin`} className="nav_btn_com nav_logout_btn">
                                <span className="ico ico12"></span>
                                <span>관리자페이지</span>
                              </Link>
                            </li>
                          )}
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
                  {/* 알림 드롭다운메뉴 */}
                  <NotificationDropdown />
                </>
              ) : (
                <div className="log_layout">
                  <Link to={`/auth`} className="nav_btn_com nav_logout_btn">
                    <span className="ico ico12"></span>
                    <span>로그인</span>
                  </Link>
                  <Link to={`/auth/join`} className="nav_btn_com nav_logout_btn">
                    <span className="ico ico15"></span>
                    <span>회원가입</span>
                  </Link>
                </div>
              )}

              {/* yein - 장바구니 버튼 추가 */}
              <div className="cart">
                <Link to="/cart/list">
                  <img src="/images/cart.png" alt="cart" />
                  {/* 장바구니 아이템 개수가 1개 이상일 때 span 추가 */}
                  {cartItem.length > 0 && (
                    <span className="cart-count">{cartItem.length}</span>
                  )}
                </Link>
              </div>

              {/* yein - 구독권 버튼 추가 */}
              <div className="subscribe">
                <Link to="/subscribe/plan">
                  <img src="/images/subscribe.png" alt="subscribe" />
                </Link>
              </div>

            </div>
            <div className="header_auth_m">
              <span className="header_auth_btn header_basket_btn" onClick={toggleMenu}>
                <img src="/images/icon_menu_w.svg" alt="메뉴 열기" />
              </span>
            </div>

          </div>
        </header>
      </div>

      {isMenuOpen && <div className="menu_backdrop" onClick={() => setIsMenuOpen(false)}></div>}

      <div className={`header_hidden_wrap ${isMenuOpen ? "active" : ""}`}>
        <div className="header_m_btn">
          <button className="header_auth_btn header_basket_btn" onClick={() => setIsMenuOpen(false)}>
            <img src="/images/icon_close.svg" alt="메뉴 닫기" />
          </button>
        </div>

        {/************ 유저의 프로필 카드 (모바일) ************/}
        <div className="nav_user_box">
          {isState ? (
            // 🔒 로그인 상태
            <div className="m_user_card">
              {/* 1단: 프로필 및 사용자 정보 */}
              <div className="m_user_info">
                <div className="m_avatar_circle">
                  <img
                    src={profileImgPath ? `${profileImgPath}` : "/images/profile_default_1.png"}
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = "/images/profile_default_1.png";
                    }}
                  />
                </div>
                <div className="m_user_text">
                  <span className="m_username">
                    <strong>{isUser?.userName || "회원"}</strong>님
                  </span>
                </div>
                <button onClick={handleLogout} className="m_logout_btn">
                  로그아웃
                </button>
              </div>

              {/* 2단: 퀵 액션 아이콘 및 타이머 */}
              <div className="m_user_actions">
                {/* 타이머 & 연장 */}
                <div className="m_timer_box">
                  <span className="m_timer_text">⏱ {timeLeft}</span>
                  <button onClick={handleRefresh} className="m_refresh_btn">연장</button>
                </div>

                {/* 퀵 아이콘 그룹 */}
                <div className="m_icon_group">
                  {/* 알림 드롭다운 */}
                  <div className="m_icon_item">
                    <NotificationDropdown />
                  </div>

                  {/* 장바구니 */}
                  <Link to="/cart/list" className="m_icon_item">
                    <img src="/images/cart.png" alt="cart" />
                    {cartItem.length > 0 && (
                      <span className="m_cart_badge">{cartItem.length}</span>
                    )}
                  </Link>

                  {/* 구독권 */}
                  <Link to="/mypage/subscribe" className="m_icon_item">
                    <img src="/images/subscribe.png" alt="subscribe" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // 🟢 비로그인 상태
            <div className="m_guest_card">
              <div className="m_guest_btn_group">
                <Link to="/auth" className="m_btn m_btn_login">로그인</Link>
                <Link to="/auth/join" className="m_btn m_btn_join">회원가입</Link>
                <Link to="/cart/list" className="m_icon_item m_guest_cart">
                  <img src="/images/cart.png" alt="cart" />
                  {cartItem.length > 0 && (
                    <span className="m_cart_badge">{cartItem.length}</span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>

        <nav className="nav">
          <ul>

            {isState ? (
              <>
                <li>
                  <strong className={`depth_m_title`}><Link to={`/mypage`}>마이페이지</Link></strong>
                </li>
                {isState && isUser?.role === 'ADMIN' && (
                  <li>
                    <strong className={`depth_m_title`}><Link to={`/admin`}>관리자페이지</Link></strong>
                  </li>
                )}
              </>
            ) : (<></>)}

            <li>
              <strong className={`depth_m_title`}><Link to={`/mountain`}>등산로 찾기</Link></strong>
            </li>
            <li>
              <strong className={`depth_m_title`}><Link to={`/crew`}>크루 찾기</Link></strong>
            </li>
            <li>
              <strong className={`depth_m_title`}><Link to={`/review`}>크루 리뷰</Link></strong>
            </li>
            <li>
              <strong onClick={(e) => handleTitleClick(e, 2)} className={`depth_m_title ${activeIndex === 2 ? "active" : ""}`}>커뮤니티</strong>
              <div className={`header_depth_m ${activeIndex === 2 ? "on" : ""}`}><Link to={`/board/notice`}>공지사항</Link></div>
              <div className={`header_depth_m ${activeIndex === 2 ? "on" : ""}`}><Link to={`/board/free`}>자유게시판</Link></div>
              <div className={`header_depth_m ${activeIndex === 2 ? "on" : ""}`}><Link to={`/board/faq`}>FAQ</Link></div>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Header;