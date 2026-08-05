import React, { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom';

const LoginPage = lazy(() => import("../page/auth/LoginPage"));
const JoinPage = lazy(() => import("../page/auth/JoinPage"));
const OAuth2RedirectHandler = lazy(() => import("../components/auth/OAuth2RedirectHandler"));
const Auth2JoinPage = lazy(() => import("../page/auth/Auth2JoinPage"));

const toAuthRouter = () => {
  return [
    {
      path: "",
      element: <Navigate replace to={"login"} />,
    },
    {
      path: "login",
      element: <LoginPage />
    },
    {
      path: "join",
      element: <JoinPage />
    },
    {
      path: "oauth2/redirect",
      element: <OAuth2RedirectHandler />
    },
    {
      path: "oauth2/join",
      element: <Auth2JoinPage />
    }
  ];
};

export default toAuthRouter