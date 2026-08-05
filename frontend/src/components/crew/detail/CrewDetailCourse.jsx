import React, { useEffect, useRef, useState } from "react";
import CrewLoadKakaoMap from "../map/CrewLoadKakaoMap";

// 코스,일정
const CrewDetailCourse = ({ crew, totalCount, courseData, segments, schedules, forecast, openNavi, openImageModal, API_URL }) => {
  const mapRef = useRef(null);
  const tags = crew.tags ? crew.tags.split(",").filter(Boolean) : [];
  const ageDisplay = (!crew.minAge && !crew.maxAge) ? "연령 제한 없음" : `${crew.minAge || '제한없음'} ~ ${crew.maxAge || '제한없음'}세`;


  useEffect(() => {

    if (!mapRef.current) return;

    CrewLoadKakaoMap().then(() => {
      mapRef.current.innerHTML = "";
      const mapOption = {
        center: new window.kakao.maps.LatLng(
          crew.meetingLat || 37.5665,
          crew.meetingLng || 126.978
        ),
        level: 5,
      };

      const map = new window.kakao.maps.Map(mapRef.current, mapOption);
      const bounds = new window.kakao.maps.LatLngBounds();
      let hasBounds = false;

      // 코스 경로(Polyline) 및 출발/도착 마커 렌더링
      if (segments && segments.length > 0) {
        // DB에서 넘어온 segments가 문자열(JSON)일 경우를 완벽 방어
        let parsedSegments = typeof segments === 'string' ? JSON.parse(segments) : segments;

        parsedSegments.forEach(seg => {
          if (!seg || seg.length === 0) return;
          const linePath = seg.map(p => {
            // lat, latitude 어떤 규격이든 찰떡같이 알아듣게 파싱
            const lat = Number(p.latitude ?? p.lat);
            const lng = Number(p.longitude ?? p.lng ?? p.lon);
            if (isNaN(lat) || isNaN(lng)) return null;

            const pt = new window.kakao.maps.LatLng(lat, lng);
            bounds.extend(pt);
            hasBounds = true;
            return pt;
          }).filter(Boolean);

          if (linePath.length > 0) {
            new window.kakao.maps.Polyline({
              map, path: linePath, strokeWeight: 5, strokeColor: '#e74c3c', strokeOpacity: 0.9, strokeStyle: 'solid', zIndex: 50
            });
          }
        });
      }
      // 출발/도착 마커 렌더링
      // 선 조각을 계산하지 않고, DB에 정확히 저장된 수동 좌표(courseData.startLat)를 사용
      if (courseData) {
        if (courseData.startLat) {
          const startPos = new window.kakao.maps.LatLng(courseData.startLat, courseData.startLon || courseData.startLng);
          new window.kakao.maps.CustomOverlay({
            position: startPos,
            content: '<div style="background:#3498db; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold; font-size:12px; border: 2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.3); transform:translateY(-120%);">출발</div>',
            map: map,
            zIndex: 60
          });
          bounds.extend(startPos);
          hasBounds = true;
        }

        if (courseData.endLat) {
          const endPos = new window.kakao.maps.LatLng(courseData.endLat, courseData.endLon || courseData.endLng);
          new window.kakao.maps.CustomOverlay({
            position: endPos,
            content: '<div style="background:#e74c3c; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold; font-size:12px; border: 2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.3); transform:translateY(-120%);">도착</div>',
            map: map,
            zIndex: 60
          });
          bounds.extend(endPos);
          hasBounds = true;
        }
      }
      // 집결지 마커 렌더링
      if (crew.meetingLat && crew.meetingLng) {
        const meetPt = new window.kakao.maps.LatLng(crew.meetingLat, crew.meetingLng);
        new window.kakao.maps.CustomOverlay({
          map,
          position: meetPt,
          content: '<div style="background:#5aa933;color:#fff;padding:5px 10px;border-radius:20px;font-weight:bold;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">🚩 집결지</div>'
        });
        bounds.extend(meetPt); hasBounds = true;
      }

      if (hasBounds) setTimeout(() => { map.setBounds(bounds); }, 300);
    });
  }, [segments, crew]);

  return (
    <>
      <div className="cd-section">
        <h3>모임 소개</h3>
        <div className="cd-desc">
          {/* 소개글 줄바꿈 (한줄씩 띄어쓰기) */}
          {crew.crewDetail?.split("\n").map((line, idx) => (<React.Fragment key={idx}>{line}<br /></React.Fragment>))}
        </div>
        <div className="cd-tags-wrap">{tags.map((tag, idx) => <span key={idx} className="cd-tag">#{tag}</span>)}</div>
      </div>

      {crew.crewFiles?.length > 1 && (
        <div className="cd-section cd-gallery">
          <h3 className="gallery-title">📷 모임 사진</h3>
          <div className="gallery-scroll">
            {crew.crewFiles.slice(1).map((f, i) => (
              <img key={i} src={`${API_URL}${f.filePath}`} alt="갤러리" className="gallery-img" onClick={() => openImageModal(`${API_URL}${f.filePath}`)} />
            ))}
          </div>
        </div>
      )}

      <div className="cd-section">
        <h3>필수 안내 사항</h3>
        <div className="cd-info-grid four-cols">
          <div className="info-box clear-bg bordered"><span className="info-label">난이도</span><strong className="info-value">{crew.crewLevel}</strong></div>
          <div className="info-box clear-bg bordered"><span className="info-label">연령 제한</span><strong className="info-value">{ageDisplay}</strong></div>
          <div className="info-box clear-bg bordered"><span className="info-label">모집 인원</span><strong className="info-value"> {totalCount}/{crew.crewPeople}명</strong><span className="info-sub">최소 {crew.minPeople || 1}명 출발</span></div>
          <div className="info-box clear-bg bordered"><span className="info-label">참가비</span><strong className="info-value price-highlight">{crew.crewPrice === 0 ? "무료" : `${crew.crewPrice?.toLocaleString()}원`}</strong>
        </div>
      </div>
      </div>

      <div className="cd-section">
        <h3>🌤 산행 당일 예보 <span className="weather-date">({crew.crewStartDate?.split('T')[0]})</span></h3>
        <div className={`cd-weather-box ${forecast.isCurrent ? "current" : "forecast"}`}>
          {forecast.loading ? ("☁️ 날씨 데이터를 불러오는 중...") : forecast.data ? (
            forecast.isCurrent ? (
              <>
                <div className="weather-icon">🌤️</div>
                <div className="weather-detail">
                  {/* 오픈메테오 데이터가 최대 16일이라 넘어가는 일정이면 현재 날씨만 나옴 */}
                  <div className="w-temp">{forecast.data.temperature}<span className="weather-sub">(예보 기간 초과로 현재 날씨 표시)</span></div>
                  <div className="w-desc">{forecast.data.description} · 습도 {forecast.data.humidity}%</div>
                </div>
              </>
            ) : (
              <>
                <div className="weather-icon">{forecast.data.icon}</div>
                <div className="weather-detail">
                  <div className="w-temp">{forecast.data.text}</div>
                  <div className="w-desc">
                    최고 {forecast.data.maxTemp}℃ / 최저 {forecast.data.minTemp}℃ · 비 올 확률 {forecast.data.rainProb}%
                  </div>
                </div>
              </>
            )
          ) : (
            "날씨 정보를 제공할 수 없습니다."
          )}
        </div>
      </div>

      <div className="cd-section mt-40">
        <h3>상세 일정표</h3>
        {schedules.length > 0 ? (
          <div className="cd-timeline">
            {schedules.map((sch, i) => (
              <div key={i} className="timeline-item">
                {/* ✨ 뱃지형 시간과 제목을 묶어주는 헤더 추가 */}
                <div className="sch-header">
                  <span className="sch-time">{sch.scheduleTime?.substring(0, 5)}</span>
                  <span className="sch-title">{sch.title}</span>
                </div>
                {sch.description && <p className="sch-desc">{sch.description}</p>}
              </div>
            ))}
          </div>
        ) : <div className="sch-empty">등록된 일정이 없습니다.</div>}
      </div>

      <div className="cd-section mt-40">
        <h3>코스 및 집결지</h3>

        <div className="course-summary-grid">
          <div className="course-item"><span>산 이름</span><strong>{crew.mountainName}</strong></div>
          <div className="course-item"><span>총 거리</span><strong> {courseData?.totalDistance ? `${courseData.totalDistance}km` : "정보 없음"}</strong></div>
          <div className="course-item"><span>예상 시간</span><strong> {courseData?.totalTime ? `${courseData.totalTime}분` : "정보 없음"} </strong></div>
          <div className="course-item"><span>최고 고도</span><strong> {courseData?.maxAltitude ? `${courseData.maxAltitude}m` : "정보 없음"} </strong></div>
        </div>

        {/* 맵 래퍼 및 길찾기 버튼 영역 */}
        <div className="course-map-wrapper">
          <div
            ref={mapRef}
            className="cd-map"
            style={{ width: '100%', height: '350px', borderRadius: '12px', background: '#eee', display: (segments?.length > 0 || (crew.meetingLat && crew.meetingLng)) ? 'block' : 'none' }}
          ></div>
          {(!segments || segments.length === 0) && (!crew.meetingLat || !crew.meetingLng) && (
            <div className="cd-map-empty" style={{ textAlign: 'center', padding: '50px', background: '#f8f9fa', borderRadius: '14px', border: '1px solid #ddd', color: '#666' }}>
              등록된 상세 코스가 없습니다.
            </div>
          )}
          {crew.meetingLat && crew.meetingLng && (
            <button className="btn-map-navi-float" onClick={openNavi}>카카오맵 길찾기</button>
          )}
        </div>

        {/* 수정된 집결지 영역 */}
        {(crew.meetingPlace || crew.mountainName) && (
          <div className="meeting-place-info">
            <span className="meeting-label">집결지</span>
            <strong className="meeting-address">{crew.meetingPlace || crew.mountainName}</strong>
          </div>
        )}
      </div>
    </>
  );
};
export default CrewDetailCourse;