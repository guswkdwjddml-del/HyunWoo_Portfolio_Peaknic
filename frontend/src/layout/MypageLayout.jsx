import React from 'react'
import { Outlet } from 'react-router-dom'
import "../css/style.css";
import MypageAside from '../components/mypage/MypageAside';
import Footer from '../components/common/Footer'
import Header from '../components/common/Header'



const MypageLayout = () => {
  return (
    <>
      <Header />
      <div className="mypage_bg">
        <div className="mypage_container">
          <MypageAside />
          <div className="mypage_inner">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default MypageLayout;
