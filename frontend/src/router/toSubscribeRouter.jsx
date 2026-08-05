import { lazy } from 'react';
import { Navigate } from "react-router-dom";

const SubscribePlanPage = lazy(() => import("../page/subscribe/SubscribePlanPage"))
const KakaoApprovalPage = lazy(() => import("../page/subscribe/kakaoPay/KakaoApprovalPage"))
const KakaoCancelFailPage = lazy(() => import("../page/subscribe/kakaoPay/KakaoCancelFailPage"))

const toSubscribeRouter = () => { // yein 작성
  return [
    {
      path: "",
      element: <Navigate replace to={"plan"} />
    },
    {
      path: "plan",
      element: <SubscribePlanPage />
    },
    {
      path: "approval/:orderNumber",
      element: <KakaoApprovalPage />
    },
    {
      path: "cancel/:orderNumber",
      element: <KakaoCancelFailPage type="cancel" />
    },
    {
      path: "fail/:orderNumber",
      element: <KakaoCancelFailPage type="fail" />
    }
  ]
}

export default toSubscribeRouter