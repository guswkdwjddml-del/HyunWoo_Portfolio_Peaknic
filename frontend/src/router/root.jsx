import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BoardLayout from '../layout/BoardLayout';
import ReviewLayout from '../layout/ReviewLayout';
import toAdminRouter from './toAdminRouter';
import toAuthRouter from './toAuthRouter';
import toBoardRouter from './toBoardRouter';
import toCartRouter from './toCartRouter';
import toCrewRouter from './toCrewRouter';
import toMountainRouter from './toMountainRouter';
import toMypageRouter from './toMypageRouter';
import toPaymentRouter from './toPaymentRouter';
import toReviewRouter from './toReviewRouter';
import PrivateAdminRoute from '../components/common/PrivateAdminRoute';
import PrivateLoginRoute from '../components/common/PrivateLoginRoute';
import toSubscribeRouter from './toSubscribeRouter';


const Loading = (
  <div className="loading">
    <h1>...Loading</h1>
  </div>
);

const MainPage = lazy(() => import("../page/MainPage"));
const AdminLayout = lazy(() => import("../layout/AdminLayout"));
const CommonLayout = lazy(() => import("../layout/CommonLayout"));
const MypageLayout = lazy(() => import("../layout/MypageLayout"));
const MountainLayout = lazy(() => import("../layout/MountainLayout"));

const root = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={Loading}>
        <MainPage />
      </Suspense>
    ),
  },
  {
    path: "admin",
    element: (
      <PrivateAdminRoute>
        <Suspense fallback={Loading}>
          <AdminLayout />
        </Suspense>
      </PrivateAdminRoute>
    ),
    children: toAdminRouter(),
  },

  {
    path: "board",
    element: (
      <Suspense fallback={Loading}>
        <BoardLayout />
      </Suspense>
    ),
    children: toBoardRouter(),
  },

  {
    path: "review",
    element: (
      <Suspense fallback={Loading}>
        <ReviewLayout />
      </Suspense>
    ),
    children: toReviewRouter(),
  },

  {
    element: (<Suspense fallback={Loading}><CommonLayout /></Suspense>),
    children: [
      { path: "auth", children: toAuthRouter() },
      { path: "crew", children: toCrewRouter() },
      { path: "cart", children: toCartRouter() },
      { path: "payment", children: toPaymentRouter() },
      { path: "subscribe", children: toSubscribeRouter() },
    ]
  },
  {
    path: "mountain",
    element: (
      <Suspense fallback={Loading}>
        <MountainLayout />
      </Suspense>
    ),
    children: toMountainRouter(),
  },
  {
    path: "mypage",
    element: (
      <PrivateLoginRoute>
        <Suspense fallback={Loading}>
          <MypageLayout />
        </Suspense>
      </PrivateLoginRoute>
    ),
    children: toMypageRouter(),
  }
]);

export default root;