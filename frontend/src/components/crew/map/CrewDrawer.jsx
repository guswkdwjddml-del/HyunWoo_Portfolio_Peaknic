import React from "react";

// 코스그리기 컴포넌트
const CrewDrawer = ({
  currentView,
  selectedMountain,
  courses,
  selectedCourse,
  drawCourseOnMap,
  setCurrentView,

  searchPanel,
  courseInfoCard,
}) => {
  return (
    <div
      className="crewMapBuilder-sidebar" >
      {currentView === "search" ? (
        searchPanel
      ) : (
        <div className="course-section">
          <button className="back-btn" onClick={() => setCurrentView("search")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
               <line x1="19" y1="12" x2="5" y2="12"></line>
               <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            목록으로
          </button>

          <h3 className="section-title">
            {selectedMountain?.mountainName} 코스 목록
          </h3>

          <div className="list-container shrinkable-list">
            {courses.map((c, idx) => (
              <div
                key={idx}
                className={`list-card ${
                  selectedCourse === c ? "active" : ""
                }`}
                onClick={() => drawCourseOnMap(idx, c)}
              >
                <div className="card-title">
                  {c.courseName}
                </div>

                <div className="card-desc">
                  길이 {c.totalLength?.toFixed(1)}km |
                  예상 {c.estimatedTime}분
                </div>

                <div className="card-badge">
                  난이도 {c.difficulty}
                </div>
              </div>
            ))}
          </div>

          {selectedCourse && courseInfoCard}
        </div>
      )}
    </div>
  );
};

export default CrewDrawer;