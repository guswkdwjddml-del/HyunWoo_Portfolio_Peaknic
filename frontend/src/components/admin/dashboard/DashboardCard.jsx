import React from 'react'
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, value, unit, link, sub }) => {

  const navigate = useNavigate();

  const clickHandler = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div
      className={`dashboardCard ${link ? "clickable" : ""}`}
      onClick={clickHandler}
    >
      <h3>{title}</h3>

      <div className="dashboardCard-total">
        {value ?? 0}
        <span>{unit}</span>
      </div>

      {sub && (
        <div className="dashboardCard-sub">
          {sub}
        </div>
      )}

    </div>
  );
};

export default DashboardCard
