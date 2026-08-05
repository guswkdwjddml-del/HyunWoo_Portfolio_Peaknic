import React from 'react'
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardCard from './DashboardCard';
import UpcomingCrew from './UpcomingCrew';
import PaymentChart from './PaymentChart';
import CrewPieChart from './CrewPieChart';
import PopularMountain from './PopularMountain';
import NoticeWidget from './NoticeWidget';
import AdminCrewModal from '../crew/AdminCrewModal';

const AdminDashboard = () => {

  const [dashboard, setDashboard] = useState({
    memberCount: {},
    crewCount: {},
    paymentCount: {},
    settlementCount: {},
    paymentChart: [],
    crewStatusChart: [],
    upcomingCrews: [],
    popularMountains: [],
    notices: []
  });

  useEffect(() => {
    axios.get("/admin/dashboard")
      .then(res => {
        console.log(res.data);
        setDashboard(res.data);
      });
  }, []);

  // 대시보드 upcomingCrew에서 AdminCrewModal 기능 연결
  const dashboardFn = () => {
    axios.get("/admin/dashboard")
      .then(res => {
        setDashboard(res.data);
      });
  };

  const [selectedCrew, setSelectedCrew] = useState(null);
  const [crewModalOpen, setCrewModalOpen] = useState(false);

  const crewDetailModalFn = (crew) => {
    setSelectedCrew(crew);
    setCrewModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCrew(null);
    setCrewModalOpen(false);
  };

  return (
    <div>
      <div className="adminDashboard">
        <div className="adminDashboard-con">

          <div className="dashboardMainArea">
            <div className="dashboardCardArea">

              <DashboardCard
                title="회원수"
                value={dashboard.memberCount?.total ?? 0}
                unit="명"
                sub={`오늘 +${dashboard.memberCount?.todayJoin ?? 0}명`}
                link="/admin/member"
              />

              <DashboardCard
                title="완료된 크루"
                value={dashboard.crewCount?.completed ?? 0}
                unit="건"
                sub={`오늘 +${dashboard.crewCount?.todayCompleted ?? 0}건`}
                link="/admin/crew"
              />

              <DashboardCard
                title="결제건수"
                value={dashboard.paymentCount?.total ?? 0}
                unit="건"
                sub={`오늘 +${dashboard.paymentCount?.today ?? 0}건`}
                link="/admin/payment"
              />

              <DashboardCard
                title="정산완료"
                value={dashboard.settlementCount?.completed ?? 0}
                unit="건"
                sub={`정산대기 ${dashboard.settlementCount?.pending ?? 0}건`}
                link="/admin/crew"
              />
            </div>

            <div className="chartArea">

              <PaymentChart
                data={dashboard.paymentChart}
              />

              <CrewPieChart
                data={dashboard.crewStatusChart}
              />

            </div>

          </div>

          <div className="upcomingCrewArea">
            <UpcomingCrew
              list={dashboard.upcomingCrews}
              crewDetailModalFn={crewDetailModalFn}
            />

          </div>

          <div className="listArea">

            <PopularMountain
              data={dashboard.popularMountains}
            />

            <NoticeWidget
              data={dashboard.notices}
            />

          </div>
        </div>
        {crewModalOpen && selectedCrew && (
          <AdminCrewModal
            crewId={selectedCrew.id}
            crewInfo={selectedCrew}
            crewListFn={dashboardFn}
            onClose={closeModal}
          />
        )}
      </div>
    </div >
  )
}

export default AdminDashboard