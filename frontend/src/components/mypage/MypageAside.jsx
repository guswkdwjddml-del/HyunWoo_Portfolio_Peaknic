import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MypageAside = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 아코디언 메뉴 토글 상태 관리 (기본적으로 회원정보 메뉴를 열어둠)
  const [openMenus, setOpenMenus] = useState({
    memberManage: true,
    crewManage: true,
    boardManage: true,
    payManage: true,
  });

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // 현재 경로와 일치하면 active 클래스 반환하는 함수
  const getActiveClass = (path) => {
    return currentPath.endsWith(path) ? "active" : "";
  };

  return (
    <aside className="mypage_aside">
      <div className="aside_title_box">
        <h2>마이페이지</h2>
      </div>

      <nav className="aside_nav">
        <ul>
          {/* 메뉴 1: 회원정보관리 */}
          <li className={`nav_group ${openMenus.memberManage ? "open" : ""}`}>
            <div className="group_trigger" onClick={() => toggleMenu("memberManage")}>
              <span>회원정보관리</span>
              <i className="arrow_icon"></i>
            </div>
            <ul className="sub_menu">
              <li className={getActiveClass("dashboard")}>
                <Link to="dashboard">- 내 대시보드</Link>
              </li>
              <li className={getActiveClass("notification")}>
                <Link to="notification">- 알림 내역</Link>
              </li>
              <li className={getActiveClass("profileChange")}>
                <Link to="profileChange">- 프로필 수정</Link>
              </li>
              <li className={getActiveClass("info")}>
                <Link to="info">- 개인회원 정보 수정</Link>
              </li>
              <li className={getActiveClass("pwChange")}>
                <Link to="pwChange">- 비밀번호 변경</Link>
              </li>
              <li className={getActiveClass("delete")}>
                <Link to="delete">- 회원 탈퇴</Link>
              </li>
            </ul>
          </li>

          {/* 메뉴 2: 모임 및 활동관리 */}
          <li className={`nav_group ${openMenus.crewManage ? "open" : ""}`}>
            <div className="group_trigger" onClick={() => toggleMenu("crewManage")}>
              <span>나의 모임 관리</span>
              <i className="arrow_icon"></i>
            </div>
            <ul className="sub_menu">
              <li className={getActiveClass("myMountainPage")}>
                <Link to="myMountainPage">- 북마크한 산</Link>
              </li>
              <li className={getActiveClass("myJoinCrew")}>
                <Link to="myJoinCrew">- 참여 모임 내역</Link>
              </li>
              {/* <li className={getActiveClass("myEditCrew")}>
                <Link to="myEditCrew">- 생성한 모임 내역</Link>
              </li> */}
            </ul>
          </li>

          <li className={`nav_group ${openMenus.payManage ? "open" : ""}`}>
            <div className="group_trigger" onClick={() => toggleMenu("payManage")}>
              <span>결제 관리</span>
              <i className="arrow_icon"></i>
            </div>
            <ul className="sub_menu">
              <li className={getActiveClass("mySubscribe")}>
                <Link to="subscribe">- 구독권</Link>
              </li>
              <li className={getActiveClass("myPayment")}>
                <Link to="payment">- 결제내역</Link>
              </li>
            </ul>
          </li>
          
          <li className={`nav_group ${openMenus.boardManage ? "open" : ""}`}>
            <div className="group_trigger" onClick={() => toggleMenu("boardManage")}>
              <span>게시물 관리</span>
              <i className="arrow_icon"></i>
            </div>
            <ul className="sub_menu">
              <li className={getActiveClass("myReview")}>
                <Link to="myReview">- 내가 쓴 리뷰</Link>
              </li>
              <li className={getActiveClass("myBoard")}>
                <Link to="myBoard">- 내가 쓴 게시물</Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default MypageAside;