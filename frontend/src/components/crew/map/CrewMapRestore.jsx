import React from 'react'


// CrewCreate,CrewDetail,CrewUpdate에서 유저 커스텀경로 복원 (미리보기 및 수정시 필요)
export const restoreCourse = ({
  initialCourseData,
  courses,
  hasRestored,
  drawCourseOnMap,
  setSelectedSubCourses,
  setCustomLength,
  setCustomTime,
  setManualStart,
  setManualEnd,
  polylinesRef,
  setHasRestored,
  setCurrentView,
  mapInstance,
  setCustomAltitude,
  setSelectedCourse
}) => {

  if (!initialCourseData || hasRestored) return;

  // 1. 산림청(VWorld) 데이터 기반 복원 (trailId가 존재하고, courses 목록이 있을 때)
  if (initialCourseData.trailId && courses && courses.length > 0) {
    const targetIndex = courses.findIndex(c => c.trailId === initialCourseData.trailId);

    if (targetIndex !== -1) {
      setCurrentView("course");
      drawCourseOnMap(targetIndex, courses[targetIndex]);

      let parsed = [];
      if (initialCourseData.selectedSegments) {
        try {
          parsed = typeof initialCourseData.selectedSegments === 'string'
            ? JSON.parse(initialCourseData.selectedSegments)
            : initialCourseData.selectedSegments;
        } catch { }
      }

      setTimeout(() => {
        const nextSet = new Set(parsed);
        setSelectedSubCourses(nextSet);
        setCustomLength(initialCourseData.totalDistance || 0);
        setCustomTime(initialCourseData.totalTime || 0);

        // 코스 복원(수정) 시에도 고도값 유지
        if (setCustomAltitude) setCustomAltitude(`${initialCourseData.maxAltitude || 0} m`);

        polylinesRef.current.forEach((line, idx) => {
          if (nextSet.has(idx)) {
            line.setOptions({ strokeColor: "#e74c3c", strokeOpacity: 1.0 });
          }
        });

        if (initialCourseData.startLat !== null && initialCourseData.startLat !== undefined) {
          setManualStart({ lat: initialCourseData.startLat, lon: initialCourseData.startLon || initialCourseData.startLng });
        }
        if (initialCourseData.endLat) {
          setManualEnd({ lat: initialCourseData.endLat, lon: initialCourseData.endLon || initialCourseData.endLng });
        }
        setHasRestored(true);
      }, 300);
      return; // VWorld 복원이 완료되었으므로 종료
    }
  }

  // 2. 나만의 코스 (단순 좌표 기반) 복원 (trailId 매칭이 안 되더라도 좌표가 있으면 그림)
  if (initialCourseData.selectedPath && mapInstance && mapInstance.current) {
    console.log("커스텀코스 복원");
    let parsedPath = [];
    try {
      parsedPath = typeof initialCourseData.selectedPath === 'string'
        ? JSON.parse(initialCourseData.selectedPath)
        : initialCourseData.selectedPath;
    } catch (e) { console.error("좌표 파싱 에러:", e); }

    if (parsedPath.length > 0) {
      // 카카오맵 위경도 포맷으로 변환
      const linePath = parsedPath.map(p =>
        new window.kakao.maps.LatLng(p.latitude || p.lat, p.longitude || p.lng || p.lon)
      );

      // 붉은 선(Polyline) 생성
      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 6,
        strokeColor: '#e74c3c',
        strokeOpacity: 1.0,
        strokeStyle: 'solid',
        zIndex: 50
      });

      // 지도에 렌더링
      polyline.setMap(mapInstance.current);
      if (polylinesRef) polylinesRef.current.push(polyline);

      setTimeout(() => {
        const bounds = new window.kakao.maps.LatLngBounds();
        linePath.forEach(pt => bounds.extend(pt));
        mapInstance.current.relayout(); // 맵 크기 다시 인식
        mapInstance.current.setBounds(bounds);
      }, 400);
      console.log("지도에 그림");

      // 출발/도착 마커 복원
      if (initialCourseData.startLat !== null && initialCourseData.startLat !== undefined) {
        setManualStart({ lat: initialCourseData.startLat, lon: initialCourseData.startLon || initialCourseData.startLng });
      }
      if (initialCourseData.endLat) {
        setManualEnd({ lat: initialCourseData.endLat, lon: initialCourseData.endLon || initialCourseData.endLng });
      }

      // 데이터를 세팅해주어야 왼쪽 사이드바에 카드가 정상적으로 나타납니다.
      if (setCurrentView) setCurrentView("course");
      if (setSelectedCourse) {
        setSelectedCourse({
          courseName: initialCourseData.courseName || "사용자 지정 코스",
          difficulty: "커스텀",
          totalLength: initialCourseData.totalDistance || 0,
          estimatedTime: initialCourseData.totalTime || 0,
        });
      }

      setCustomLength(initialCourseData.totalDistance || 0);
      setCustomTime(initialCourseData.totalTime || 0);
      if (setCustomAltitude) setCustomAltitude(`${initialCourseData.maxAltitude || 0} m`);

      setHasRestored(true);
    }
  }
};