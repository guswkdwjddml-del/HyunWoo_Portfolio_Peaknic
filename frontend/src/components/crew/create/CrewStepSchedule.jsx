import React from "react";


// 4단계(step) 타임라인(일정표) 구성
const CrewStepSchedule = ({ schedules, setSchedules }) => {

  const addSchedule = () => setSchedules([...schedules, { scheduleTime: "", title: "", description: "" }]);
  
  const updateSchedule = (index, field, value) => { 
      const newSchedules = [...schedules]; 
      newSchedules[index][field] = value; 
      setSchedules(newSchedules); 
  };
  
  const removeSchedule = (index) => setSchedules(schedules.filter((_, i) => i !== index));

  return (
    <div className="cc-step-content fade-in">
      <h2>등산 일정을 타임라인으로 구성해주세요</h2>
      <p className="subtitle">상세한 일정은 참여율을 높여줍니다.</p>

      <div className="timeline-builder">
        {schedules.map((sch, idx) => (
          <div key={idx} className="schedule-row">
            <div className="s-time">
                <input type="time" value={sch.scheduleTime} onChange={(e) => updateSchedule(idx, "scheduleTime", e.target.value)}/>
            </div>
            <div className="s-content">
              <input type="text" placeholder="일정 제목 (예: 백운대 도착)" value={sch.title} onChange={(e) => updateSchedule(idx, "title", e.target.value)}/>
              <input type="text" placeholder="상세 설명 (선택)" value={sch.description} onChange={(e) => updateSchedule(idx, "description", e.target.value)}/>
            </div>
            <button className="btn-remove-sch" onClick={() => removeSchedule(idx)}>✕</button>
          </div>
        ))}
        <button className="btn-add-sch" onClick={addSchedule}>+ 일정 추가하기</button>
      </div>
    </div>
  );
};

export default CrewStepSchedule;