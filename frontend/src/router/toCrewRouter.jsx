import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import PrivateHostRoute from "../components/common/PrivateHostRoute";

const CrewListPage = lazy(() => import("../page/crew/CrewListPage"));
const CrewCreatePage = lazy(() => import("../page/crew/CrewCreatePage"));
const CrewDetailPage = lazy(() => import("../page/crew/CrewDetailPage"))
const CrewUpdatePage = lazy(()=> import("../page/crew/CrewUpdatePage"));

const toCrewRouter = () => {
  return [
    {
      path: "", // /crew 경로
      element: (<CrewListPage/>),
    },
    {
      path: "create", // /crew/create 경로
      element: ( <PrivateHostRoute> <CrewCreatePage/> </PrivateHostRoute> ),
    },
    {
      path: "update/:id", // /crew/update 경로
      element: ( <PrivateHostRoute> <CrewUpdatePage/> </PrivateHostRoute>  ),
    },
    {
      path: ":id", // /crew/:id 상세 페이지 경로
      element: ( <CrewDetailPage/> ),
    },
  ];
};

export default toCrewRouter;
