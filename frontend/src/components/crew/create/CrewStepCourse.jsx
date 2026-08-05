import React, { useState, useEffect, useRef } from "react";

// 두 좌표(위도, 경도) 사이의 거리를 미터 단위로 계산해주는 함수 (선 엉킴 방지용)
const getDistanceMeter = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


// 자식 컴포넌트 1: 코스 썸네일 지도 (폴리라인 렌더링 통합)
const CourseThumbnailMap = ({ coursePayload }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !containerRef.current || !coursePayload) return;

    const startLat = Number(coursePayload.startLat || 37.5665);
    const startLng = Number(coursePayload.startLon || coursePayload.startLng || 126.978);

    const map = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(startLat, startLng),
      level: 6
    });

    let bounds = new window.kakao.maps.LatLngBounds();
    let hasBounds = false;

    // DB와 동일한 2차원 배열(separatedSegments) 규격으로 완벽 통합
    let parsedSegments = [];
    if (coursePayload.separatedSegments) {
      parsedSegments =
        typeof coursePayload.separatedSegments === "string"
          ? JSON.parse(coursePayload.separatedSegments)
          : coursePayload.separatedSegments;
    } else if (coursePayload.selectedPath) {
      // 구버전(1차원 배열) 데이터 호환용 방어 코드
      let parsedPath = typeof coursePayload.selectedPath === 'string'
        ? JSON.parse(coursePayload.selectedPath) : coursePayload.selectedPath;
      if (parsedPath && parsedPath.length > 0) parsedSegments = [parsedPath];
    }

    // 통일된 2차원 배열을 순회하며 다중 폴리라인 렌더링
    parsedSegments.forEach(segment => {
      if (!segment || segment.length === 0) return;
      const linePath = segment.map(p => {
        // lat, latitude 어떤 이름표로 들어와도 무조건 인식하도록 호환성 극대화
        const lat = Number(p.lat ?? p.latitude);
        const lng = Number(p.lng ?? p.lon ?? p.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        const latlng = new window.kakao.maps.LatLng(lat, lng);
        bounds.extend(latlng);
        hasBounds = true;
        return latlng;
      }).filter(Boolean);

      if (linePath.length > 0) {
        new window.kakao.maps.Polyline({
          map: map, path: linePath, strokeWeight: 5, strokeColor: '#e74c3c', strokeOpacity: 0.9, strokeStyle: 'solid', zIndex: 50
        });
      }
    });

    // 출발/도착 마커 렌더링
    if (coursePayload.startLat) {
      const startPos = new window.kakao.maps.LatLng(coursePayload.startLat, coursePayload.startLon || coursePayload.startLng);
      new window.kakao.maps.CustomOverlay({
        position: startPos, content: '<div style="background:#3498db; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold; font-size:12px; border: 2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.3); transform:translateY(-120%);">출발</div>', map: map
      });
      bounds.extend(startPos); hasBounds = true;
    }

    if (coursePayload.endLat) {
      const endPos = new window.kakao.maps.LatLng(coursePayload.endLat, coursePayload.endLon || coursePayload.endLng);
      new window.kakao.maps.CustomOverlay({
        position: endPos, content: '<div style="background:#e74c3c; color:#fff; padding:4px 8px; border-radius:20px; font-weight:bold; font-size:12px; border: 2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.3); transform:translateY(-120%);">도착</div>', map: map
      });
      bounds.extend(endPos); hasBounds = true;
    }

    if (hasBounds) map.setBounds(bounds);
    map.setDraggable(false); map.setZoomable(false);

    const resizeObserver = new ResizeObserver(() => {
      map.relayout();
      if (hasBounds) map.setBounds(bounds);
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [coursePayload]);

  return <div ref={containerRef} style={{ width: "100%", height: "180px", borderRadius: "8px", margin: "15px 0", border: "1px solid #ddd" }}></div>;
};


// 자식 컴포넌트 2: 집결지 설정 미니맵
const MeetingMiniMap = ({ centerLat, centerLng, onLocationSelect }) => {
  const containerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // 카카오 지도를 생성하고 🔻집결지 마커를 띄운 뒤 클릭 이벤트를 등록하는 효과
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !containerRef.current) return;

    const map = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(centerLat || 37.5665, centerLng || 126.978),
      level: 4,
    });
    mapInstance.current = map;

    const marker = new window.kakao.maps.CustomOverlay({
      position: map.getCenter(),
      content: '<div style="background:#5aa933; color:#fff; padding:5px 12px; border-radius:20px; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3); transform:translateY(-150%);">🔻 집결지</div>',
      map: map
    });
    markerInstance.current = marker;

    window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      marker.setPosition(latlng);
      onLocationSelect(latlng.getLat(), latlng.getLng());
    });

    const resizeObserver = new ResizeObserver(() => {
      map.relayout();
      map.setCenter(marker.getPosition());
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 외부(검색 등)에서 집결지 좌표가 바뀌면 지도 중심과 마커 위치를 함께 이동시켜주는 효과
  useEffect(() => {
    if (mapInstance.current && markerInstance.current && centerLat && centerLng) {
      const loc = new window.kakao.maps.LatLng(centerLat, centerLng);
      mapInstance.current.setCenter(loc);
      markerInstance.current.setPosition(loc);
    }
  }, [centerLat, centerLng]);

  return <div ref={containerRef} className="mini-map"></div>;
};


// 2단계(step) 설정 - 코스지도,집결지설정, 미니맵
const CrewStepCourse = ({ crewData, setCrewData, handleInput, coursePayload, isMapLoaded, setIsMapModalOpen }) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  // 장소 검색 후 클릭 시 좌표를 모임 정보에 업데이트하는 함수
  const searchPlace = () => {
    if (!searchKeyword.trim()) return alert("검색어를 입력해주세요.");
    if (!window.kakao || !window.kakao.maps.services) return;
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setCrewData((prev) => ({ ...prev, meetingLat: parseFloat(data[0].y), meetingLng: parseFloat(data[0].x) }));
      } else alert("검색 결과가 없습니다.");
    });
  };

  return (
    <div className="cc-step-content fade-in">
      <h2>어떤 코스로 등산하나요?</h2>

      {coursePayload ? (
        <div className="selected-course-card">
          <h3>✅ 코스가 지정되었습니다</h3>
          {isMapLoaded && <CourseThumbnailMap coursePayload={coursePayload} />}
          <button className="btn-outline" onClick={() => setIsMapModalOpen(true)}>코스 다시 그리기</button>
        </div>
      ) : (
        <div className="empty-course">
          <p>아직 코스가 지정되지 않았습니다.</p>
          <button className="btn-map-open" onClick={() => setIsMapModalOpen(true)}>🗺️ 모달 열어서 코스 그리기</button>
        </div>
      )}

      <div className="input-group mt-20">
        <label style={{ fontSize: "16px", color: "#e74c3c" }}>🔻 집결 장소(모임 장소)를 지도에 클릭해주세요!</label>
        <div className="map-search-bar">
          <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchPlace()} placeholder="예: 북한산성 매표소, 불광역" />
          <button onClick={searchPlace}>검색</button>
        </div>
        <small className="info-text">💡 코스를 지정하면 출발 지점이 기본 집결지로 자동 포커스됩니다.</small>

        {isMapLoaded && (
          <MeetingMiniMap
            centerLat={crewData.meetingLat || coursePayload?.startLat}
            centerLng={crewData.meetingLng || coursePayload?.startLon || coursePayload?.startLng}
            onLocationSelect={(lat, lng) => setCrewData(prev => ({ ...prev, meetingLat: lat, meetingLng: lng }))}
          />
        )}

        <p className="coords-text">
          {crewData.meetingLat ? `선택된 좌표: ${crewData.meetingLat.toFixed(5)}, ${crewData.meetingLng.toFixed(5)}` : "지도를 클릭해서 마커를 찍어주세요."}
        </p>
      </div>

      <div className="input-group mt-20">
        <label>집결 장소 상세 안내 (텍스트)</label>
        <input type="text" name="meetingPlace" value={crewData.meetingPlace} onChange={handleInput} placeholder="예: 탐방지원센터 앞 GS25 편의점" />
      </div>
    </div>
  );
};

export default CrewStepCourse;