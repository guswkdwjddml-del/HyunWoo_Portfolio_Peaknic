import React, { lazy } from 'react'
import { Navigate } from "react-router-dom";
import PrivateLoginRoute from '../components/common/PrivateLoginRoute';


const ReviewList = lazy(() => import("../page/board/review/ReviewListPage")); //리뷰 목록
const ReviewWrite = lazy(() => import("../page/board/review/ReviewWritePage")); // 리뷰 등록
const ReviewDetail = lazy(() => import("../page/board/review/ReviewDetailPage")); //리뷰 상세
const ReviewUpdate = lazy(()=> import("../page/board/review/ReviewUpdatePage")) //리뷰 수정 


const Loading = (
  <div className="loading">
    <h1>...Loading</h1>
  </div>
);
 //게시판 리뷰 라우터
const toReviewRouter = () => {
   return [

        {
            index:true,
            element:<ReviewList/>
        },

        {
            path:"write",
            element:<PrivateLoginRoute><ReviewWrite/></PrivateLoginRoute>
        },

         {
            path:"update/:id",
            element:<PrivateLoginRoute><ReviewUpdate/></PrivateLoginRoute>
        },

        {
            path:"detail/:id",
            element:<ReviewDetail/>
        }

    ];

};

export default toReviewRouter