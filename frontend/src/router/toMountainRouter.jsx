import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom';
import PrivateAdminRoute from '../components/common/PrivateAdminRoute.jsx';

const MountainListPage = lazy(() => import("../page/mountain/MountainListPage"));
const MountainDetailPage = lazy(()=> import("../page/mountain/MountainDetailPage.jsx"));
const MountainAdminPage = lazy(()=> import("../page/mountain/MountainAdminPage.jsx"));

const toMountainRouter = () => {
  return [
    {
      path: "",     // 산 메인
      element: <Navigate replace to={"list"} />,
    },
    {
      path: "list", // 산 리스트
      element: <MountainListPage />
    },
    {
      path: ":id", // 산 상세페이지
      element: <MountainDetailPage />
    },
    {
      path: "admin", // 산 관리자페이지
      element: <PrivateAdminRoute><MountainAdminPage /></PrivateAdminRoute>
    }
  ];
};

export default toMountainRouter