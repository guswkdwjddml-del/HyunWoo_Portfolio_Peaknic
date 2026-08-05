import React from 'react'
import { formatDateTime } from '../../../utils/commonModule';

const UpcomingCrew = ({ list, crewDetailModalFn }) => {

  return (
    <div className="upcomingCrew">
      <h3>출발 예정</h3>
      {
        list && list.length > 0 ? (
          <div className="upcomingCrew-list">
            {
              list.map((crew) => (

                <div
                  className="upcomingCrew-item"
                  key={crew.id}
                  onClick={() => crewDetailModalFn(crew)}
                >
                  <div className="crewName">
                    <label>크루명</label>
                    {crew.crewName}
                  </div>

                  <div className="crewStartDate">
                    <label>출발일</label>
                    {formatDateTime(crew.crewStartDate)}
                  </div>

                  <div className="crewPeople">
                    <label>참여인원</label>
                    {crew.currentPeople}
                    /
                    {crew.crewPeople}
                  </div>

                  <div className="mountainName">
                    <label>산이름</label>
                    {crew.mountainName}
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="upcomingCrew-empty">
            출발 예정 크루가 없습니다.
          </div>
        )
      }
    </div>
  );
};

export default UpcomingCrew