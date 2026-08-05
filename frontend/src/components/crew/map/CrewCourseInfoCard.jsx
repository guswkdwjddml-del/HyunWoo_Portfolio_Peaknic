import React from 'react';

// 코스경로 세부정보
const CrewCourseInfoCard = ({
  selectedCourse, selectedMountain, customLength, customTime, customAltitude, weatherInfo,
  resetSelection, swapStartEnd, placementMode, setPlacementMode,
}) => {
  return (
    <div className="modern-info-card floating">
      <div className="card-header-flex">
        <h3>{selectedCourse.courseName}</h3>
        <span className="badge-level">{selectedCourse.difficulty}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="label">총 길이</span>
          <span className="value">{selectedCourse.totalLength?.toFixed(1)} km</span>
        </div>
        <div className="stat-item">
          <span className="label">소요 시간</span>
          <span className="value">{selectedCourse.estimatedTime}분</span>
        </div>
        <div className="stat-item">
          <span className="label">정상 고도</span>
          <span className="value">{selectedMountain?.height}m</span>
        </div>
      </div>

      <div className="custom-stats-box">
        <div className="cs-row"><strong>내 코스 길이</strong> <span>{customLength.toFixed(1)} km</span></div>
        <div className="cs-row"><strong>내 코스 시간</strong> <span>{customTime}분</span></div>
        <div className="cs-row"><strong>내 코스 고도</strong> <span>{customAltitude}</span></div>
      </div>

      <div className="weather-pill">
        {weatherInfo.loading ? "☁️ 실시간 날씨 불러오는 중..." : weatherInfo.data ? (
          <span>🌦️ {weatherInfo.data.description} | {weatherInfo.data.temperature}</span>
        ) : "날씨 정보를 읽지 못했습니다."}
      </div>

      <div className="marker-controls">
        <button className={`btn-marker ${placementMode === "start" ? "active" : ""}`} onClick={() => setPlacementMode(placementMode === "start" ? null : "start")}>
          {placementMode === "start" ? "지정 중" : "출발 지정"}
        </button>
        <button className={`btn-marker ${placementMode === "end" ? "active" : ""}`} onClick={() => setPlacementMode(placementMode === "end" ? null : "end")}>
          {placementMode === "end" ? "지정 중" : "도착 지정"}
        </button>
        {/* 🌟 반전 버튼도 1:1 비율을 위해 동일한 btn-marker 클래스 부여 */}
        <button className="btn-marker" onClick={swapStartEnd} title="출발/도착 반전">
          🔄 반전
        </button>
      </div>

    </div>
  );
};
export default CrewCourseInfoCard;