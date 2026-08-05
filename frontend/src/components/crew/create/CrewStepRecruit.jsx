import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko"; // 한글 달력 플러그인 추가

// 3단계(step) 달력모달, 모집정보
const CrewStepRecruit = ({ crewData, setCrewData, handleInput, isAgeLimitFree, setIsAgeLimitFree }) => {
  // 달력 클릭 시 활성화할 마커 상태 (deadline, startDate, endDate)
  const [activeMarker, setActiveMarker] = useState(null);

  // 달력에 이벤트가 겹쳐서 잘릴경우, 작은 창띄우는 상태
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, events: [] });

  // 시간 설정 모달 상태
  const [timeModal, setTimeModal] = useState({ isOpen: false, date: "", time: "09:00" });

  // 달력의 빈 날짜를 클릭했을 때 모달창을 띄우는 함수
  const handleDateClick = (info) => {
    if (!activeMarker) return alert("먼저 상단의 [마커 버튼]을 선택한 뒤 날짜를 클릭해주세요!");
    
    const clickedDate = info.dateStr; // "YYYY-MM-DD"
    
    // 한국 기준 오늘 날짜 문자열 ("YYYY-MM-DD")
    const todayStr = new Date().toLocaleDateString("sv-SE"); 

    // 과거 날짜 방어 로직 (문자열 비교로 타임존 오차 완전 차단)
    if (clickedDate < todayStr) {
      return alert("과거 날짜는 선택할 수 없습니다.");
    }
    
    setTimeModal({ isOpen: true, date: clickedDate, time: "09:00" });
  };

  // 모달창에서 시간을 결정하고 확인 버튼을 누를 때의 방어 로직
  const confirmTime = () => {
    // 1. 초 단위(:00)를 붙여 표준 ISO 형태(YYYY-MM-DDTHH:mm:ss)로 작성
    const dateTimeStr = `${timeModal.date}T${timeModal.time}:00`; 

    const newDateObj = new Date(dateTimeStr);
    const { crewStartDate, crewEndDate, crewDeadline } = crewData;
    const now = new Date();

    if (newDateObj <= now) {
      return alert("🚨 모집 마감 또는 일정 시작 시간은 현재 시간 이후여야 합니다.");
    }

    // 날짜 논리모순 방어 로직
    if (activeMarker === 'crewDeadline') {
      if (crewStartDate && newDateObj >= new Date(crewStartDate)) return alert("마감 일시는 등산 시작 시간보다 빨라야 합니다.");
      if (crewEndDate && newDateObj >= new Date(crewEndDate)) return alert("마감 일시는 등산 종료 시간보다 빨라야 합니다.");
    }
    if (activeMarker === 'crewStartDate') {
      if (crewDeadline && newDateObj <= new Date(crewDeadline)) return alert("등산 시작은 마감 시간 이후여야 합니다.");
      if (crewEndDate && newDateObj >= new Date(crewEndDate)) return alert("등산 시작은 종료 시간보다 빨라야 합니다.");
    }
    if (activeMarker === 'crewEndDate') {
      if (crewStartDate && newDateObj <= new Date(crewStartDate)) return alert("등산 종료는 시작 시간 이후여야 합니다.");
      if (crewDeadline && newDateObj <= new Date(crewDeadline)) return alert("등산 종료는 마감 시간 이후여야 합니다.");
    }

    // 통과 시 데이터를 업데이트하고 모달 닫기
    setCrewData(prev => ({ ...prev, [activeMarker]: dateTimeStr }));
    setTimeModal({ isOpen: false, date: "", time: "09:00" });
    setActiveMarker(null);
  };

  // 시간 포맷을 '오전/오후 HH:MM'으로 바꿔주는 함수
  const formatAMPM = (timeStr) => {
    if (!timeStr) return "시간 미설정 (날짜를 클릭하세요)";
    let [hours, minutes] = timeStr.split(":");
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? "오후" : "오전";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시는 12시로 표시
    const paddedHours = String(hours).padStart(2, '0');
    return `${ampm} ${paddedHours}:${minutes}`;
  };

  // 캘린더에 시간표시
  const calendarEvents = [
    // 배경 색상용
    crewData.crewDeadline && { start: crewData.crewDeadline.split("T")[0], display: "background", color: "#ffe8e8" },
    crewData.crewStartDate && { start: crewData.crewStartDate.split("T")[0], display: "background", color: "#e8f7e8" },
    crewData.crewEndDate && { start: crewData.crewEndDate.split("T")[0], display: "background", color: "#e8f1ff" },

    // 글씨 표시용
    crewData.crewDeadline && {
      start: crewData.crewDeadline,
      title: "모집 마감",
      extendedProps: {
        time: crewData.crewDeadline.split("T")[1],
        type: "deadline"
      }
    },

    crewData.crewStartDate && {
      start: crewData.crewStartDate,
      title: "등산 시작",
      extendedProps: {
        time: crewData.crewStartDate.split("T")[1],
        type: "start"
      }
    },

    crewData.crewEndDate && {
      start: crewData.crewEndDate,
      title: "등산 종료",
      extendedProps: {
        time: crewData.crewEndDate.split("T")[1],
        type: "end"
      }
    }

  ].filter(Boolean);


  // 선택된 날짜의 "달력 칸(Cell) 전체" 배경색을 칠하기 위한 로직
  const dayCellClassNames = (arg) => {
    const year = arg.date.getFullYear();
    const month = String(arg.date.getMonth() + 1).padStart(2, '0');
    const day = String(arg.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    let classes = [];
    if (crewData.crewDeadline && crewData.crewDeadline.startsWith(dateStr)) classes.push('bg-deadline');
    if (crewData.crewStartDate && crewData.crewStartDate.startsWith(dateStr)) classes.push('bg-start');
    if (crewData.crewEndDate && crewData.crewEndDate.startsWith(dateStr)) classes.push('bg-end');
    return classes;
  };


  // 달력에 이벤트 표시
  const renderEventContent = (eventInfo) => {
    if (eventInfo.event.display === "background") { return null; }
    const { type } = eventInfo.event.extendedProps;
    return (
      <div className={`custom-event-content ${type}`}>
        <div className="ev-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  // 달력 이벤트에 마우스 가져다대면 보이는 정보
  const handleEventMouseEnter = (info) => {
    if (info.event.display === "background") return; // 배경 이벤트 마우스 호버 방지
    const rect = info.el.getBoundingClientRect();
    const sameDayEvents = calendarEvents.filter(event =>
      event.start.startsWith(info.event.startStr.substring(0, 10))
      && event.display !== "background"
    );
    setTooltip({ visible: true, x: rect.left + window.scrollX, y: rect.bottom + window.scrollY, events: sameDayEvents });
  };


  const handleEventMouseLeave = () => {
    setTooltip(prev => ({
      ...prev,
      visible: false
    }));
  };


  return (
    <div className="cc-step-content fade-in">
      <h2>모집 세부 설정을 진행해주세요</h2>

      <div className="cc-grid-inputs three-cols">
        <div className="input-group"><label>모집 인원 (명)</label><input type="number" name="crewPeople" value={crewData.crewPeople} onChange={handleInput} /></div>
        <div className="input-group"><label>최소 출발 (명)</label><input type="number" name="minPeople" value={crewData.minPeople} onChange={handleInput} /></div>
        <div className="input-group"><label>참가비 (원)</label><input type="number" name="crewPrice" value={crewData.crewPrice} onChange={handleInput} /></div>
      </div>

      <div className="cc-grid-inputs">
        <div className="input-group">
          <label>난이도</label>
          <select name="crewLevel" value={crewData.crewLevel} onChange={handleInput} className="custom-select">
            <option value="초보">🌱 초보 (누구나 가능)</option>
            <option value="중수">🌿 중수 (등산 경험자)</option>
            <option value="고수">🌲 고수 (숙련자 전용)</option>
          </select>
        </div>

        <div className="input-group age-group">
          <div className="age-header">
            <label>연령 제한 (세)</label>
            <label className="checkbox-label"><input type="checkbox" checked={isAgeLimitFree} onChange={(e) => setIsAgeLimitFree(e.target.checked)} /> 제한 없음</label>
          </div>
          <div className="age-inputs">
            <input type="number" name="minAge" value={crewData.minAge} onChange={handleInput} disabled={isAgeLimitFree} placeholder="최소" />
            <span>~</span>
            <input type="number" name="maxAge" value={crewData.maxAge} onChange={handleInput} disabled={isAgeLimitFree} placeholder="최대" />
          </div>
        </div>
      </div>

      <div className="interactive-calendar-wrapper mt-40">
        <h3 className="calendar-guide-text">마커를 먼저 선택한 후, 달력에서 날짜를 지정해주세요</h3>

        {/* 마커 버튼 */}
        <div className="marker-buttons">
          <button className={`marker-btn deadline ${activeMarker === 'crewDeadline' ? 'active' : ''}`} onClick={() => setActiveMarker('crewDeadline')}>
            <div className="m-title">모집 마감</div>
            <div className="m-time">{crewData.crewDeadline ? formatAMPM(crewData.crewDeadline.split('T')[1]) : "시간 미설정"}</div>
          </button>

          <button className={`marker-btn start ${activeMarker === 'crewStartDate' ? 'active' : ''}`} onClick={() => setActiveMarker('crewStartDate')}>
            <div className="m-title">등산 시작</div>
            <div className="m-time">{crewData.crewStartDate ? formatAMPM(crewData.crewStartDate.split('T')[1]) : "시간 미설정"}</div>
          </button>

          <button className={`marker-btn end ${activeMarker === 'crewEndDate' ? 'active' : ''}`} onClick={() => setActiveMarker('crewEndDate')}>
            <div className="m-title">등산 종료</div>
            <div className="m-time">{crewData.crewEndDate ? formatAMPM(crewData.crewEndDate.split('T')[1]) : "시간 미설정"}</div>
          </button>
        </div>

        <div className="large-calendar">
          <FullCalendar
            locale={koLocale}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventContent={renderEventContent}
            dayMaxEvents={2}
            dateClick={handleDateClick}
            dayCellClassNames={dayCellClassNames} /* 셀 배경색 바인딩 추가 */
            height={650}
            dayCellContent={(arg) => arg.dayNumberText.replace("일", "")}
            eventMouseEnter={handleEventMouseEnter}   // 달력 이벤트에 마우스가져다대면 나오는 인포창
            eventMouseLeave={handleEventMouseLeave}   // 달력 이벤트에 마우스를떼면 꺼짐
          />
        </div>
      </div>

      {/* 시간 설정 모달 */}
      {timeModal.isOpen && (
        <div className="time-modal-overlay">
          <div className="time-modal-box">
            <h4>시간 설정</h4>
            <p className="tm-date-display">{timeModal.date}</p>
            <input
              className="tm-time-input"
              type="time" 
              value={timeModal.time}
              onChange={(e) => setTimeModal(prev => ({ ...prev, time: e.target.value }))}
              onClick={(e) => { try { if (e.target.showPicker) e.target.showPicker(); } catch (err) { } }}
              onKeyDown={(e) => { if (e.key === 'Enter') {e.preventDefault(); confirmTime(); }}}
              onWheel={(e) => e.target.blur()}
              autoFocus
            />
            <div className="tm-actions">
              <button className="tm-cancel" onClick={() => setTimeModal({ isOpen: false, date: '', time: '09:00' })}>취소</button>
              <button className="tm-confirm" onClick={confirmTime}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 달력 이벤트 마우스 정보창 */}
      {tooltip.visible && (
        <div className="calendar-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.events.map((event, index) => (
            <div className="tooltip-item" key={index}>
              <div className="tooltip-title">{event.title}</div>
              <div className="tooltip-time">{formatAMPM(event.extendedProps.time)}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CrewStepRecruit;