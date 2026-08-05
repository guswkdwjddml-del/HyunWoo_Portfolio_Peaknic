import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const CartListPage = lazy(() => import("../page/cart/CartListPage"));

const toCartRouter = () => { // yein 작성
  return [
    {
      path: "",
      element: <Navigate replace to={"list"} />
    },
    {
      path: "list",
      element: <CartListPage />
    }
  ];
};

export default toCartRouter