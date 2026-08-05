import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import PrivateLoginRoute from '../components/common/PrivateLoginRoute';

const PaymentListPage = lazy(() => import("../page/payment/PaymentListPage"));
const PaymentDetailPage = lazy(() => import("../page/payment/PaymentDetailPage"));
const KakaoApprovalPage = lazy(() => import("../page/payment/KakaoPay/KakaoApprovalPage"));
const KakaoCancelFailPage = lazy(() => import("../page/payment/KakaoPay/KakaoCancelFailPage"));

const toPaymentRouter = () => { // yein 작성
  return [
    {
      path: "",
      element: <Navigate replace to={"list"} />
    },
    {
      path: "list",
      element: <PrivateLoginRoute><PaymentListPage /></PrivateLoginRoute>
    },
    {
      path: "detail/:orderNumber",
      element: <PrivateLoginRoute><PaymentDetailPage /></PrivateLoginRoute>
    },
    {
      path: "approval/:orderNumber",
      element: <PrivateLoginRoute><KakaoApprovalPage /></PrivateLoginRoute>
    },
    {
      path: "cancel/:orderNumber",
      element: <PrivateLoginRoute><KakaoCancelFailPage type="cancel" /></PrivateLoginRoute>
    },
    {
      path: "fail/:orderNumber",
      element: <PrivateLoginRoute><KakaoCancelFailPage type="fail" /></PrivateLoginRoute>
    }
  ];
}

export default toPaymentRouter