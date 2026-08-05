import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom';

const DashboardPage = lazy(() => import("../page/mypage/DashboardPage"));
const InfoPage = lazy(() => import("../page/mypage/InfoPage"));
const DeletePage = lazy(() => import("../page/mypage/DeletePage"));
const PwChangePage = lazy(() => import("../page/mypage/PwChangePage"));
const ProfileChangePage = lazy(() => import("../page/mypage/ProfileChangePage"));
const MyMountainPage = lazy(() => import("../page/mypage/MyMountainPage"));
const MyJoinCrewPage = lazy(() => import("../page/mypage/MyJoinCrewPage"));
const MyEditCrewPage = lazy(() => import("../page/mypage/MyEditCrewPage"));
const MyReviewPage = lazy(() => import("../page/mypage/MyReviewPage"));
const MyBoardPage = lazy(() => import("../page/mypage/MyBoardPage"));
const MyNotificationPage = lazy(() => import("../page/mypage/MyNotificationPage"));
const MySubscribePage = lazy(() => import("../page/mypage/MySubscribePage"));
const MyPaymentPage = lazy(() => import("../page/mypage/MyPaymentPage"));

const toMypageRouter = () => {
  return [
    {
      path: "",
      element: <Navigate replace to={"dashboard"} />,
    },
    {
      path: "dashboard",
      element: <DashboardPage />
    },
    {
      path: "info",
      element: <InfoPage />
    },
    {
      path: "delete",
      element: <DeletePage />
    },
    {
      path: "pwChange",
      element: <PwChangePage />
    },
    {
      path: "profileChange",
      element: <ProfileChangePage />
    },
    {
      path: "myMountainPage",
      element: <MyMountainPage />
    },
    {
      path: "myJoinCrew",
      element: <MyJoinCrewPage />
    },
    {
      path: "myEditCrew",
      element: <MyEditCrewPage />
    },
    {
      path: "myReview",
      element: <MyReviewPage />
    },
    {
      path: "myBoard",
      element: <MyBoardPage />
    },
    {
      path: "notification",
      element: <MyNotificationPage />
    },
    {
      path: "subscribe",
      element: <MySubscribePage />
    },
    {
      path: "payment",
      element: <MyPaymentPage />
    }
  ];
};

export default toMypageRouter