import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import AdminBoardPage from "../page/admin/AdminBoardPage";
import AdminBoardList from "../components/admin/board/AdminBoardList";
import AdminBoardWrite from "../components/admin/board/AdminBoardWrite";
import AdminBoardDetail from "../components/admin/board/AdminBoardDetail";
import AdminPaymentPage from "../page/admin/AdminPaymentPage";
import AdminMountain from "../components/admin/mountain/AdminMountain";
import AdminMountainDetail from "../components/admin/mountain/AdminMountainDetail";
import AdminNotificationPage from "../page/admin/AdminNotificationPage";
import AdminNotificationList from "../components/admin/notification/AdminNotificationList";
import AdminNotificationWrite from "../components/admin/notification/AdminNotificationWrite";

const AdminDashboardPage = lazy(
  () => import("../page/admin/AdminDashboardPage"),
);
const AdminMemberPage = lazy(() => import("../page/admin/AdminMemberPage"));
const AdminCrewPage = lazy(() => import("../page/admin/AdminCrewPage"));
const AdminMountainPage = lazy(() => import("../page/admin/AdminMountainPage"));

const Loading = (
  <div className="loading">
    <h1>...Loading</h1>
  </div>
);

const toAdminRouter = () => {
  return [
    {
      path: "",
      element: <Navigate replace to={"dashboard"} />,
    },
    {
      path: "dashboard",
      element: (
        <Suspense fallback={Loading}>
          <AdminDashboardPage />
        </Suspense>
      ),
    },
    {
      path: "member",
      element: (
        <Suspense fallback={Loading}>
          <AdminMemberPage />
        </Suspense>
      ),
    },
    {
      path: "crew",
      element: (
        <Suspense fallback={Loading}>
          <AdminCrewPage />
        </Suspense>
      ),
    },
    {
      path: "payment",
      element: (
        <Suspense fallback={Loading}>
          <AdminPaymentPage />
        </Suspense>
      ),
    },
    {
      path: "board/:category",
      element: <AdminBoardPage />,
      children: [
        {
          path: "",
          element: <AdminBoardList />,
        },
        {
          path: "write",
          element: <AdminBoardWrite />,
        },
        {
          path: "detail/:id",
          element: <AdminBoardDetail />,
        },
      ],
    },
    {
      path: "mountain",
      element: <AdminMountainPage />,
      children: [
        {
          path: "",
          element: <AdminMountain />,
        },
        {
          path: "detail/:id",
          element: <AdminMountainDetail />,
        },
      ],
    },
    {
      path: "notification",
      element: <AdminNotificationPage />,
      children: [
        {
          path: "",
          element: <AdminNotificationList />,
        },
        {
          path: "write",
          element: <AdminNotificationWrite />,
        },
      ],
    },
  ];
};

export default toAdminRouter;
