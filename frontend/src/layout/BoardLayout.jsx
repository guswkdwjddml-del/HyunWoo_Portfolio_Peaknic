import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import BoardLeftcon from '../components/board/BoardLeftcon'
import { Outlet } from 'react-router-dom'
import "../css/style.css";
import "../css/board/boardLayout.css";

//컴포넌트명은 대문자로 시작되는지 확인
const BoardLayout = () => {
  console.log("BoardLayout 렌더링"); //디버깅용
  return (
    <>
    {/* 공통헤더 */}
    <Header/>
    {/* 게시물 페이지 메뉴바->왼쪽 배치*-> import 확인 */}
    <div className="boardContent">
      <BoardLeftcon/>
    {/* 각 페이지 변경*/}
    <Outlet/> 
    </div>
    {/* 공통푸터 */}
     <Footer/>
    </>
  )
}



export default BoardLayout