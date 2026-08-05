import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CrewMapSearchPanel from "./CrewMapSearchPanel";
import CrewCourseInfoCard from "./CrewCourseInfoCard";
import { restoreCourse } from "./CrewMapRestore";
import '../../../css/crew/crewMapBuilder.css'
import CrewDrawer from "./CrewDrawer";
import CrewLoadKakaoMap from "./CrewLoadKakaoMap";


// 두 좌표(위도, 경도) 사이의 거리를 미터 단위로 계산해주는 함수
const getDistanceMeter = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const CrewMapBuilder = ({ onSaveCourse, onClose, predefinedMountain, initialCourseData }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const startOverlayRef = useRef(null);
  const endOverlayRef = useRef(null);
  const polylinesRef = useRef([]); // 지도에 그려진 선 객체들을 관리하는 배열
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  // 초기 데이터를 딱 한 번만 복원하기 위한 체크 변수
  const [hasRestored, setHasRestored] = useState(false);
  // 현재 화면 상태(검색창 vs 코스목록) 및 선택된 정보들 관리
  const [currentView, setCurrentView] = useState("search");
  const [courses, setCourses] = useState([]);
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseIndex, setCourseIndex] = useState(-1);
  // 사용자가 클릭한 코스 조각 정보와 합산된 거리, 시간, 고도 관리
  const [selectedSubCourses, setSelectedSubCourses] = useState(new Set());
  const [customLength, setCustomLength] = useState(0);
  const [customTime, setCustomTime] = useState(0);
  const [customAltitude, setCustomAltitude] = useState("-");
  // 지도 위 수동 출발지/도착지 설정 모드 및 최종 좌표 관리
  const [placementMode, setPlacementMode] = useState(null);
  const [manualStart, setManualStart] = useState(null);
  const [manualEnd, setManualEnd] = useState(null);
  const [finalStart, setFinalStart] = useState(null);
  const [finalEnd, setFinalEnd] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState({ loading: false, data: null });
  const catchersRef = useRef([]);  // 클릭 감지용 투명하고 두꺼운 선 (선택한 경로 해제시 보정하기)

  // 카카오맵 이벤트 리스너 안에서 최신 상태(State)를 참조하기 위한 Ref 업데이트
  const mapStateRef = useRef({});
  useEffect(() => {
    mapStateRef.current = { placementMode, selectedCourse, selectedSubCourses, manualStart, manualEnd, courses, courseIndex };
  }, [placementMode, selectedCourse, selectedSubCourses, manualStart, manualEnd, courses, courseIndex]);

  // 카카오맵 스크립트를 동적으로 불러오고 초기화
  useEffect(() => {
    CrewLoadKakaoMap()
      .then(() => setIsMapLoaded(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.relayout();
      }, 100);
    }
  }, [currentView]);

  // 지도가 로드되면 화면에 지도를 그리고 마커/이벤트를 세팅
  useEffect(() => {
    if (!isMapLoaded || !mapContainer.current) return;
    const options = { center: new window.kakao.maps.LatLng(37.5665, 126.978), level: 8 };
    const map = new window.kakao.maps.Map(mapContainer.current, options);
    mapInstance.current = map;

    setTimeout(() => { map.relayout(); map.setCenter(options.center); }, 300);

    // 출발/도착 마커(커스텀 오버레이) 디자인 세팅
    startOverlayRef.current = new window.kakao.maps.CustomOverlay({
      content: '<div style="background:#3498db; color:#fff; padding:5px 12px; border-radius:20px; font-weight:bold; font-size:13px; box-shadow:0 2px 4px rgba(0,0,0,0.3); transform:translateY(-120%); border: 2px solid #fff;">출발</div>',
      zIndex: 30
    });
    endOverlayRef.current = new window.kakao.maps.CustomOverlay({
      content: '<div style="background:#e74c3c; color:#fff; padding:5px 12px; border-radius:20px; font-weight:bold; font-size:13px; box-shadow:0 2px 4px rgba(0,0,0,0.3); transform:translateY(-120%); border: 2px solid #fff;">도착</div>',
      zIndex: 20
    });

    // 지도 클릭 시 수동 출발/도착점 설정 로직
    window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
      const state = mapStateRef.current;
      if (!state.placementMode || state.courseIndex === -1) return;
      if (state.selectedSubCourses.size === 0) {
        alert("먼저 경로를 1개 이상 선택해주세요!");
        setPlacementMode(null);
        return;
      }

      const clickLat = mouseEvent.latLng.getLat();
      const clickLng = mouseEvent.latLng.getLng();
      const activeCourse = state.courses[state.courseIndex];
      let endpoints = [];

      state.selectedSubCourses.forEach((idx) => {
        const p = activeCourse.subCourses[idx].path;
        if (p?.length) {
          endpoints.push(p[0]);
          endpoints.push(p[p.length - 1]);
        }
      });

      if (endpoints.length === 0) return;
      let closestPoint = endpoints[0];
      let minDist = Infinity;

      // 클릭한 위치에서 가장 가까운 경로 끝점 찾기
      endpoints.forEach((pt) => {
        const dist = getDistanceMeter(clickLat, clickLng, pt.latitude, pt.longitude);
        if (dist < minDist) { minDist = dist; closestPoint = pt; }
      });

      // 클릭 반경 조절하기
      if (minDist > 300) {
        alert("끝점 근처를 클릭해주세요.");
        setPlacementMode(null);
        return;
      }

      // 출발/도착 모드에 따라 좌표 저장
      if (state.placementMode === "start") setManualStart({ lat: closestPoint.latitude, lon: closestPoint.longitude });
      else setManualEnd({ lat: closestPoint.latitude, lon: closestPoint.longitude });

      setPlacementMode(null);
    });
  }, [isMapLoaded]);

  // 자식 컴포넌트(검색 패널)에서 산을 선택했을 때 코스 목록을 서버에서 불러오는 함수
  const selectMountain = async (mountain, isAutoSearch = false) => {
    setSelectedMountain(mountain);
    try {
      const courseRes = await axios.get(`/api/trails/mountain/${mountain.id}`);
      setCourses(courseRes.data);
      setCurrentView("course");
      console.log(courseRes.data);

      // 수정 모드(initialCourseData)에서 '자동 검색'된 경우, 
      // 지도의 시야(포커스)를 1번 코스로 강제 이동시키지 않도록 차단!
      if (initialCourseData && isAutoSearch) {
        return;
      }

      const firstSub = courseRes.data[0]?.subCourses?.[0];
      if (firstSub && firstSub.path && firstSub.path.length > 0 && mapInstance.current) {
        const firstPt = firstSub.path[0];
        mapInstance.current.panTo(new window.kakao.maps.LatLng(firstPt.latitude, firstPt.longitude));
      }
    } catch (err) {
      alert("코스 리스트 조회 실패");
    }
  };

  // 모달이 열릴 때 산 상세정보(MountainDetail.jsx)에서 전달되어 자동으로 검색 (MountainCourseList.jsx)
  useEffect(() => {
    // 카카오맵이 로딩 완료되었고, 부모가 넘겨준 산 이름이 있을 때만 동작
    if (predefinedMountain && isMapLoaded) {
      axios.get(`/api/mountains/search`, {
        params: { mountainName: predefinedMountain }
      })
        .then(res => {
          // 검색 결과가 있다면 가장 첫 번째 산을 자동으로 선택(클릭)한 것과 똑같이 만듭니다.
          if (res.data.content && res.data.content.length > 0) {
            selectMountain(res.data.content[0], true);
          }
        })
        .catch(err => console.error("산 자동 검색 에러:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predefinedMountain, isMapLoaded]);

  // 선택한 코스의 조각들을 지도에 그려주고 클릭 이벤트를 달아주는 핵심 기능
  const drawCourseOnMap = (index, course) => {
    setCurrentView("course");

    if (!window.kakao || !window.kakao.maps) return alert("지도를 불러오는 중입니다.");
    setCourseIndex(index);
    setSelectedCourse(course);
    setSelectedSubCourses(new Set());
    setCustomLength(0);
    setCustomTime(0);
    // 새 코스 선택 시 기존 수동 마커 제거
    setManualStart(null);
    setManualEnd(null);
    startOverlayRef.current?.setMap(null);
    endOverlayRef.current?.setMap(null);
    polylinesRef.current.forEach((line) => line.setMap(null));
    polylinesRef.current = [];

    // 투명 터치 영역 지우기 (선택 경로해제시 보정값)
    catchersRef.current.forEach((line) => line.setMap(null));
    catchersRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();

    // 코스 내 각각의 subCourse(구간)마다 별도의 선(Polyline)을 그림
    course.subCourses.forEach((sub, subIdx) => {
      const linePath = sub.path.map((c) => {
        const latlng = new window.kakao.maps.LatLng(c.latitude, c.longitude);
        if (c.latitude > 30 && c.longitude > 120) bounds.extend(latlng);
        return latlng;
      });

      // 선택한 경로 (눈에 보이는 선)
      const polyline = new window.kakao.maps.Polyline({
        path: linePath, strokeWeight: 8, strokeOpacity: 0.8, strokeColor: "#c09393ff", strokeStyle: "solid" // 기본경로 색상
      });

      // 클릭/터치 감지용 보이지 않는 두꺼운 선 (터치 반경 300% 확보)
      const clickCatcher = new window.kakao.maps.Polyline({
        path: linePath, strokeWeight: 45, strokeOpacity: 0.01, strokeColor: "#ffffff"
      });

      // 마우스 오버/아웃 시 선 색상 변경(호버 효과)
      window.kakao.maps.event.addListener(polyline, "mouseover", () => {
        if (!mapStateRef.current.selectedSubCourses.has(subIdx)) polyline.setOptions({ strokeColor: "#f39c12", strokeOpacity: 0.8 }); // 마우스가져다대면 나오는 색상
      });
      window.kakao.maps.event.addListener(polyline, "mouseout", () => {
        if (!mapStateRef.current.selectedSubCourses.has(subIdx)) polyline.setOptions({ strokeColor: "#c09393ff", strokeOpacity: 0.6 }); // 마우스때면 나오는 색상 == 기본경로 색상
      });

      // 클릭 시 해당 코스 조각을 선택/해제하고 시간과 거리를 더하거나 빼줌
      window.kakao.maps.event.addListener(polyline, "click", () => {
        // 경로 변경하면 기존 수동 출발/도착 제거
        setManualStart(null);
        setManualEnd(null);

        setSelectedSubCourses((prev) => {
          const nextSet = new Set(prev);
          if (nextSet.has(subIdx)) {
            nextSet.delete(subIdx);
            polyline.setOptions({ strokeColor: "#f39c12", strokeOpacity: 0.8 });  // 경로 선택해제시 색상
            setCustomLength((l) => l - (sub.length || 0));
            setCustomTime((t) => t - (sub.time || 0));
          } else {
            nextSet.add(subIdx);
            polyline.setOptions({ strokeColor: "#ff0000ff", strokeOpacity: 1.0 });  // 선택된 경로 색상
            setCustomLength((l) => l + (sub.length || 0));
            setCustomTime((t) => t + (sub.time || 0));

            // 클릭 시 해당 코스의 중간 지점으로 카메라 부드럽게 이동 (필요없으면 if문 주석)
            if (linePath.length > 0) {
              const midPoint = linePath[Math.floor(linePath.length / 2)];
              mapInstance.current.panTo(midPoint);
            }

          }
          return nextSet;
        });
      });
      polyline.setMap(mapInstance.current);
      polylinesRef.current.push(polyline);
    });

    if (!bounds.isEmpty()) setTimeout(() => mapInstance.current.setBounds(bounds, 50, 50, 50, 50), 400);

    if (course.subCourses[0]?.path[0]) {
      const firstLoc = course.subCourses[0].path[0];
      fetchWeather(selectedMountain?.mountainName || predefinedMountain, firstLoc.latitude, firstLoc.longitude);
    }
  };

  // 백엔드 API를 호출하여 날씨 정보를 가져오는 함수
  const fetchWeather = async (mName, lat, lon) => {
    setWeatherInfo({ loading: true, data: null });
    try {
      const res = await axios.get(`/api/weather`, { params: { mountainName: mName, lat, lon } });
      setWeatherInfo({ loading: false, data: res.data });
    } catch (e) {
      setWeatherInfo({ loading: false, data: null });
    }
  };

  // 선택된 코스 조각들의 최고 고도를 Open-Meteo API로 계산해 주는 효과
  useEffect(() => {
    if (!selectedCourse || selectedSubCourses.size === 0) {
      setCustomAltitude("-");
      return;
    }
    const segments = Array.from(selectedSubCourses).map((idx) => selectedCourse.subCourses[idx]).filter(Boolean);
    let coordsList = segments.flatMap((s) => s.path.map((p) => ({ lat: p.latitude, lng: p.longitude })));
    if (coordsList.length === 0) return;

    const sampleRate = Math.max(1, Math.floor(coordsList.length / 20));
    const sampled = coordsList.filter((_, i) => i % sampleRate === 0);
    const lats = sampled.map((c) => c.lat).join(",");
    const lngs = sampled.map((c) => c.lng).join(",");

    setCustomAltitude("계산 중...");
    axios.get(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`)
      .then((res) => {
        if (res.data && res.data.elevation) setCustomAltitude(`${Math.max(...res.data.elevation).toFixed(0)} m`);
      }).catch(() => setCustomAltitude("조회 실패"));
  }, [selectedSubCourses, selectedCourse]);

  // 선택된 코스를 바탕으로 최종 출발지와 도착지 마커를 지도에 찍어주는 효과
  useEffect(() => {
    if (!selectedCourse || selectedSubCourses.size === 0) {
      startOverlayRef.current?.setMap(null);
      endOverlayRef.current?.setMap(null);
      setFinalStart(null);
      setFinalEnd(null);
      return;
    }

    let allPaths = [];
    selectedSubCourses.forEach((idx) => {
      if (selectedCourse.subCourses?.[idx]) {
        allPaths.push(selectedCourse.subCourses[idx].path);
      }
    });

    let endPoints = [];
    allPaths.forEach((path) => {
      if (path.length > 0) { endPoints.push(path[0]); endPoints.push(path[path.length - 1]); }
    });

    let pointCounts = [];
    endPoints.forEach((pt) => {
      let found = false;
      for (let i = 0; i < pointCounts.length; i++) {
        if (Math.abs(pointCounts[i].pt.latitude - pt.latitude) < 0.0005 && Math.abs(pointCounts[i].pt.longitude - pt.longitude) < 0.0005) {
          pointCounts[i].count++; found = true; break;
        }
      }
      if (!found) pointCounts.push({ pt: pt, count: 1 });
    });

    let trueExtremes = pointCounts.filter((p) => p.count === 1).map((p) => p.pt);
    let startNode, endNode;

    if (trueExtremes.length === 0) { startNode = allPaths[0][0]; endNode = allPaths[0][0]; }
    else if (trueExtremes.length >= 2) {
      let maxDist = -1;
      for (let i = 0; i < trueExtremes.length; i++) {
        for (let j = i + 1; j < trueExtremes.length; j++) {
          let dist = Math.pow(trueExtremes[i].latitude - trueExtremes[j].latitude, 2) + Math.pow(trueExtremes[i].longitude - trueExtremes[j].longitude, 2);
          if (dist > maxDist) { maxDist = dist; startNode = trueExtremes[i]; endNode = trueExtremes[j]; }
        }
      }
    } else {
      const sortedIdx = Array.from(selectedSubCourses).sort((a, b) => a - b);
      startNode = selectedCourse.subCourses[sortedIdx[0]].path[0];
      const lastPath = selectedCourse.subCourses[sortedIdx[sortedIdx.length - 1]].path;
      endNode = lastPath[lastPath.length - 1];
    }

    if (manualStart) startNode = { latitude: manualStart.lat, longitude: manualStart.lon };
    if (manualEnd) endNode = { latitude: manualEnd.lat, longitude: manualEnd.lon };

    startOverlayRef.current?.setPosition(new window.kakao.maps.LatLng(startNode.latitude, startNode.longitude));
    endOverlayRef.current?.setPosition(new window.kakao.maps.LatLng(endNode.latitude, endNode.longitude));
    startOverlayRef.current?.setMap(mapInstance.current);
    endOverlayRef.current?.setMap(mapInstance.current);

    setFinalStart({ lat: startNode.latitude, lon: startNode.longitude });
    setFinalEnd({ lat: endNode.latitude, lon: endNode.longitude });
  }, [selectedSubCourses, manualStart, manualEnd, selectedCourse]);

  // 사용자의 코스 조각 선택과 수동 마커 세팅을 모두 초기화하는 함수
  const resetSelection = () => {
    setSelectedSubCourses(new Set());
    setCustomLength(0); setCustomTime(0); setManualStart(null); setManualEnd(null);
    polylinesRef.current.forEach((line) => line.setOptions({ strokeColor: "#bdc3c7", strokeOpacity: 0.6 }));
  };

  // 출발지와 도착지의 좌표를 서로 바꿔주는 함수
  const swapStartEnd = () => {
    if (!finalStart || !finalEnd) return alert("먼저 경로를 선택해주세요.");
    const sTemp = finalStart;
    setManualStart({ lat: finalEnd.lat, lon: finalEnd.lon });
    setManualEnd({ lat: sTemp.lat, lon: sTemp.lon });
  };

  // 선택된 출발/도착지 좌표를 바탕으로 카카오맵 길찾기를 새 창으로 열어주는 함수
  const openNavi = () => {
    if (!finalStart || !finalEnd) return alert("코스를 먼저 선택해주세요.");
    const startKakao = new window.kakao.maps.LatLng(finalStart.lat, finalStart.lon).toCoords();
    const endKakao = new window.kakao.maps.LatLng(finalEnd.lat, finalEnd.lon).toCoords();
    window.open(`https://map.kakao.com/?sX=${startKakao.getX()}&sY=${startKakao.getY()}&sName=출발지&eX=${endKakao.getX()}&eY=${endKakao.getY()}&eName=도착지`, "_blank");
  };

  useEffect(() => {
    // 지도 준비 전 대기
    if (!isMapLoaded) return;
    // 기존 코스 데이터 없으면 실행 안함
    if (!initialCourseData) return;

    // trailId && 커스텀코스 없어도 그리기
    if (initialCourseData.trailId && (!courses || courses.length === 0)) return;

    restoreCourse({
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
      mapInstance, //Restore 함수가 붉은 선을 직접 그릴 수 있도록 맵 객체를 던져줍니다!
      setSelectedCourse,
      setCustomAltitude
    });
  }, [courses, initialCourseData, hasRestored, isMapLoaded]);

  // 완성된 코스를 부모(create)로 보내는 함수
  const handleSaveCourse = async () => {
    // 1. 유저가 공식 코스를 새롭게 클릭하여 경로를 재구성한 경우
    if (selectedCourse && selectedSubCourses.size > 0) {
      let mergedPath = [];
      const sortedSubCourses = Array.from(selectedSubCourses).sort((a, b) => a - b);
      sortedSubCourses.forEach((idx) => {
        selectedCourse.subCourses[idx].path.forEach((p) => mergedPath.push({ latitude: p.latitude, longitude: p.longitude }));
      });

      // 폴리라인 그리기위한 분절 정보
      const separatedSegments = sortedSubCourses.map((idx) => selectedCourse.subCourses[idx].path);

      const requestData = {
        mountainName: selectedMountain?.mountainName || predefinedMountain,
        courseName: selectedCourse.courseName,
        totalDistance: parseFloat(customLength.toFixed(1)),
        totalTime: customTime,
        maxAltitude: parseInt(String(customAltitude).replace(/[^0-9]/g, "")) || 0,
        startLat: finalStart?.lat, startLon: finalStart?.lon,
        endLat: finalEnd?.lat, endLon: finalEnd?.lon,
        selectedPath: JSON.stringify(mergedPath),
        trailId: selectedCourse.trailId,
        selectedSegments: JSON.stringify(Array.from(selectedSubCourses).sort((a, b) => a - b)),
      };

      const savedCourseData = {
        ...(initialCourseData || {}),
        ...requestData,
        separatedSegments: separatedSegments,
        mountainId: selectedMountain?.id
      };

      onSaveCourse(savedCourseData, selectedMountain?.id);

      alert("코스가 지정되었습니다.");

    }
    // 2. 코스를 건드리지 않고 기존 데이터를 그대로 유지하려는 경우 (수정 모드 완벽 대응)
    else if (initialCourseData) {
      // 수동 마커(출발/도착)를 움직였다면 그 좌표만 살짝 반영해주고 나머지는 그대로 리턴
      const preservedCourse = {
        ...initialCourseData,
        startLat: manualStart ? manualStart.lat : initialCourseData.startLat,
        startLon: manualStart ? manualStart.lon : (initialCourseData.startLon || initialCourseData.startLng),
        endLat: manualEnd ? manualEnd.lat : initialCourseData.endLat,
        endLon: manualEnd ? manualEnd.lon : (initialCourseData.endLon || initialCourseData.endLng),
      };

      onSaveCourse(preservedCourse, selectedMountain?.id || initialCourseData.mountainId);
      alert("기존 코스 설정이 그대로 유지되었습니다!");
    }
    // 3. 아무것도 선택하지 않은 백지 상태일 때
    else {
      alert("지도에서 경로를 1개 이상 선택해주세요!");
    }
  };

  // 선택된 경로나 마커가 있는 위치로 카메라 이동
  const moveToSelection = () => {
    if (!mapInstance.current) return;

    let bounds = new window.kakao.maps.LatLngBounds();
    let hasPoints = false;

    // 1. 새롭게 선택된 서브코스가 있으면 바운더리에 포함
    if (selectedSubCourses.size > 0 && selectedCourse) {
      selectedSubCourses.forEach((idx) => {
        selectedCourse.subCourses[idx].path.forEach((p) => {
          bounds.extend(new window.kakao.maps.LatLng(p.latitude, p.longitude));
          hasPoints = true;
        });
      });
    }
    // 🌟 2. 기존에 복원된 코스가 있으면 바운더리에 포함
    else if (initialCourseData && initialCourseData.selectedPath) {
      let parsedPath = typeof initialCourseData.selectedPath === 'string'
        ? JSON.parse(initialCourseData.selectedPath)
        : initialCourseData.selectedPath;

      parsedPath.forEach((p) => {
        bounds.extend(new window.kakao.maps.LatLng(p.latitude || p.lat, p.longitude || p.lng || p.lon));
        hasPoints = true;
      });
    }

    // 3. 수동 마커가 있으면 바운더리에 포함
    const s = finalStart || manualStart;
    if (s) { bounds.extend(new window.kakao.maps.LatLng(s.lat, s.lon)); hasPoints = true; }

    const e = finalEnd || manualEnd;
    if (e) { bounds.extend(new window.kakao.maps.LatLng(e.lat, e.lon)); hasPoints = true; }

    if (hasPoints) {
      mapInstance.current.setBounds(bounds, 50, 50, 50, 50);
    } else {
      alert("선택된 경로나 수동 마커가 없습니다.");
    }
  };

  return (
    <div className="crewMapBuilder-layout" style={{ display: 'flex', width: '100%', height: '100%' }}>

      {/* 좌측 사이드바: 검색 창 혹은 선택된 산의 코스 리스트 출력 */}
      <CrewDrawer
        currentView={currentView}
        selectedMountain={selectedMountain}
        courses={courses}
        selectedCourse={selectedCourse}
        drawCourseOnMap={drawCourseOnMap}
        setCurrentView={setCurrentView}

        searchPanel={
          <CrewMapSearchPanel selectMountain={selectMountain} />
        }

        courseInfoCard={
          <CrewCourseInfoCard
            selectedCourse={selectedCourse}
            selectedMountain={selectedMountain}
            customLength={customLength}
            customTime={customTime}
            customAltitude={customAltitude}
            weatherInfo={weatherInfo}
            resetSelection={resetSelection}
            swapStartEnd={swapStartEnd}
            placementMode={placementMode}
            setPlacementMode={setPlacementMode}
          />
        }
      />

      {/* 우측 지도 영역: 카카오맵이 그려지는 공간 */}
      <div className="crewMapBuilder-map-container" style={{ flex: 1, width: 0, height: "100%", position: "relative" }}>
        <div className="kakao-map" ref={mapContainer} style={{ width: '100%', height: '100%' }}></div>

        {/* 지도 우측 하단 플로팅 액션 버튼 그룹 */}
        {(selectedCourse || initialCourseData) && (
          <div className="map-floating-actions">
            {/* 리셋(새로고침) 아이콘 - 완벽 대칭형 */}
            <button className="map-icon-btn" onClick={resetSelection} title="선택 초기화">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.4 5.4" />
              </svg>
            </button>
            {/* 내 위치(타겟) 아이콘 - 정중앙 과녁형 */}
            <button className="map-icon-btn" onClick={moveToSelection} title="현재 찍은 좌표로 이동">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            {/* 메인 생성 버튼 */}
            <button className="map-float-btn submit" onClick={handleSaveCourse}>
              코스 지정
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default CrewMapBuilder;