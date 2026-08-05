import React from "react";
import { Outlet } from "react-router-dom";
import "../css/style.css";
import "../css/board/boardLayout.css";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
const ReviewLayout = () => {
  return (
    <>
      {/* 공통헤더 */}
      <Header />
      {/* 각 페이지 변경*/}
      <Outlet />
      {/* 공통푸터 */}
      <Footer />
    </>
  );
};

export default ReviewLayout;
