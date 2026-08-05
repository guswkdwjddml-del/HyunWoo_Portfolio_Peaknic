import React, { lazy } from 'react'
import { Navigate } from "react-router-dom";
import PrivateLoginRoute from '../components/common/PrivateLoginRoute';

//게시글 페이지 종류 -> 라우터랑 일치하는지 확인 
//서스펜스 태그 있는지 확인
//페이지 위치 변경 시 같이 변경할것
const BoardSavePage = lazy(() => import("../page/board/common/BoardWritePage")); // 게시글 등록
const BoardListPage = lazy(() => import("../page/board/common/BoardListPage")); //게시글 목록 조회
const BoardListDetailPage = lazy(() => import("../page/board/common/BoardListDetailPage")); //게시글 목록 조회 상세

const Loading = (
  <div className="loading">
    <h1>...Loading</h1>
  </div>
);

const toBoardRouter = () => {

  return  [


    {
      index:true,
      element:<Navigate to="notice" replace/>
    },

    // 상세
    {
      path:"detail/:id",
      element:<BoardListDetailPage/>
    },

    // 등록
    {
      path:"save",
      element:<PrivateLoginRoute><BoardSavePage/></PrivateLoginRoute>
    },

    {
      path:"update/:id",
      element:<PrivateLoginRoute><BoardSavePage/></PrivateLoginRoute>
    },

    // 목록
    {
      path:":category",
      element:<BoardListPage/>
    }


  ];

};
export default toBoardRouter;



