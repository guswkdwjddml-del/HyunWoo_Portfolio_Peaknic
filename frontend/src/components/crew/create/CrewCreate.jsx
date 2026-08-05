import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import "../../../css/crew/crewCreate.css";
import CrewStepBasic from "./CrewStepBasic";
import CrewStepCourse from "./CrewStepCourse";
import CrewStepRecruit from "./CrewStepRecruit";
import CrewStepSchedule from "./CrewStepSchedule";
import CrewMapBuilder from "../map/CrewMapBuilder";
import CrewLoadKakaoMap from "../map/CrewLoadKakaoMap";


const CrewCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isAgeLimitFree, setIsAgeLimitFree] = useState(false);

  // 모임의 모든 텍스트/숫자 데이터를 담는 통합 State
  const [crewData, setCrewData] = useState({
    crewName: "", crewDetail: "", crewPeople: 2, minPeople: 1, crewPrice: 0,
    minAge: 20, maxAge: 50, crewLevel: "초보",
    crewStartDate: "", crewEndDate: "", crewDeadline: "",
    meetingPlace: "", meetingLat: null, meetingLng: null, chatLink: ""
  });

  const [initialCourseType, setInitialCourseType] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [coursePayload, setCoursePayload] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [schedules, setSchedules] = useState([{ scheduleTime: "06:00", title: "집결", description: "지정된 장소에서 모임" }]);

  // step 값이 변경될 때마다 동작 (step1 -> step2 -> ,,, 스크롤 맨위로)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // 산 상세 페이지에서 넘어온 데이터를 처리로직
  useEffect(() => {
    const passedData = location.state;
    if (!passedData) return;

    if (passedData.predefinedMountain) {
      setCrewData(prev => ({ ...prev, mountainName: passedData.predefinedMountain }));
    }
    setInitialCourseType(passedData.courseType);

    // 추천 코스(RECOMMENDED)를 DB(CustomCourse) 규격과 100% 동일하게 파싱
    if (passedData.courseType === 'RECOMMENDED' && passedData.courseData) {
      const trail = passedData.courseData;
      let fullPath = [];
      let separatedSegments = [];

      if (trail.subCourses) {
        separatedSegments = trail.subCourses.map(sub => {
          if (!sub.path) return [];

          const segmentPath = sub.path.map(p => ({
            lat: p.latitude || p.lat,   // 통일된 프론트 규격 lat
            lng: p.longitude || p.lng || p.lon // 통일된 프론트 규격 lng
          }));
          fullPath = [...fullPath, ...segmentPath];
          return segmentPath;
        });
      }

      const startCoord = fullPath.length > 0 ? fullPath[0] : null;
      const endCoord = fullPath.length > 0 ? fullPath[fullPath.length - 1] : null;

      // 백엔드 저장용 데이터
      const recommendedCourse = {
        mountainName: passedData.predefinedMountain,
        courseName: trail.courseName,
        totalDistance: trail.totalLength,
        totalTime: trail.estimatedTime,
        maxAltitude: trail.maxAltitude || 0,

        startLat: startCoord?.lat,
        startLon: startCoord?.lng,
        endLat: endCoord?.lat,
        endLon: endCoord?.lng,

        selectedPath: JSON.stringify(fullPath),
        selectedSegments: JSON.stringify(separatedSegments),

        trailId: trail.trailId
      };
      // 백엔드 전송용
      setCourseData(recommendedCourse);
      // 화면 표시용
      setCoursePayload({
        mountainId: passedData.mountainId,
        mountainName: passedData.predefinedMountain,
        trailId: trail.trailId,
        courseName: trail.courseName,
        totalDistance: trail.totalLength,
        totalTime: trail.estimatedTime,

        selectedPath: fullPath,
        separatedSegments,

        startLat: startCoord?.lat,
        startLng: startCoord?.lng,
        startLon: startCoord?.lng,

        endLat: endCoord?.lat,
        endLng: endCoord?.lng,
        endLon: endCoord?.lng
      });
    }
  }, [location.state]);

  // Step 2 제어 로직
  useEffect(() => {
    if (step === 1 && initialCourseType === 'CUSTOM' && !coursePayload) {
      setIsMapModalOpen(true);
    }
  }, [step, initialCourseType, coursePayload]);

  // 카카오맵 동적 로딩
  useEffect(() => {
    CrewLoadKakaoMap()
      .then(() => setIsMapLoaded(true))
      .catch((err) => console.error("카카오맵 로드 에러:", err));
  }, []);


  const handleInput = (e) => {
    const { name, value } = e.target;
    if (["crewPeople", "minPeople", "crewPrice", "minAge", "maxAge"].includes(name)) {
      if (value !== "" && Number(value) < 0) return;
    }
    setCrewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCourse = (savedCourse, mountainId) => {
    setCoursePayload({ ...savedCourse, mountainId });
    setCrewData((prev) => ({
      ...prev,
      meetingLat: savedCourse.startLat || prev.meetingLat,
      meetingLng: savedCourse.startLon || savedCourse.startLng || prev.meetingLng
    }));
    setIsMapModalOpen(false);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!coursePayload) return alert("등산 코스를 먼저 지정해주세요.");
      if (!crewData.meetingLat || !crewData.meetingLng) return alert("미니맵을 클릭해서 집결지를 찍어주세요.");
    }
    if (step === 2 && !crewData.crewName.trim()) return alert("모임 이름을 입력해주세요.");
    if (step === 3) {
      if (Number(crewData.minPeople) > Number(crewData.crewPeople)) return alert("최소 출발 인원은 총 모집 인원을 초과할 수 없습니다.");
      if (!isAgeLimitFree && Number(crewData.minAge) > Number(crewData.maxAge)) return alert("최소 연령이 최대 연령보다 높을 수 없습니다.");
      if (!crewData.crewStartDate || !crewData.crewEndDate || !crewData.crewDeadline) return alert("일정을 모두 달력에 지정해주세요.");

      const start = new Date(crewData.crewStartDate);
      const end = new Date(crewData.crewEndDate);
      const deadline = new Date(crewData.crewDeadline);

      if (deadline >= start) return alert("🚨 모집 마감 일시는 등산 시작 시간보다 무조건 빨라야 합니다.");
      if (start >= end) return alert("🚨 등산 종료 일시는 등산 시작 시간 이후여야 합니다.");
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(crewData).forEach((key) => {
      if (isAgeLimitFree && (key === "minAge" || key === "maxAge")) return;
      const val = crewData[key];
      if (val !== null && val !== undefined && val !== "") formData.append(key, val);
    });
    if (tags.length > 0) formData.append("tags", tags.join(","));
    if (imageFiles.length > 0) imageFiles.forEach((file) => formData.append("files", file));

    let finalCourseId = coursePayload?.id || coursePayload?.customCourseId;

    if (courseData) {
      formData.append("courseData", new Blob([JSON.stringify(courseData)], { type: "application/json" }));
    }
    if (!courseData && coursePayload && !finalCourseId) {
      try {
        const courseDto = {
          mountainName: crewData.mountainName || "사용자 지정 코스",
          courseName: crewData.crewName + " 코스",
          totalDistance: coursePayload.totalDistance || 0,
          totalTime: coursePayload.totalTime || 0,
          maxAltitude: coursePayload.maxAltitude || 0,
          startLat: coursePayload.startLat,
          startLon: coursePayload.startLon || coursePayload.startLng,
          endLat: coursePayload.endLat,
          endLon: coursePayload.endLon || coursePayload.endLng,
          selectedPath: typeof coursePayload.selectedPath === 'string' ? coursePayload.selectedPath : JSON.stringify(coursePayload.selectedPath),
          selectedSegments: coursePayload.selectedSegments ? JSON.stringify(coursePayload.selectedSegments) : null,
          trailId: coursePayload.trailId || null
        };
        const courseRes = await axios.post(`/api/custom-courses`, courseDto);
        finalCourseId = courseRes.data.id || courseRes.data.customCourseId || courseRes.data;
      } catch (e) { console.error("코스 저장 실패", e); }
    }
    if (finalCourseId) formData.append("customCourseId", finalCourseId);
    formData.append("mountainId", coursePayload?.mountainId || 1);

    try {
      // Create(모임 생성) 요청
      const crewRes = await axios.post(`/api/crews`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` // 토큰 확인 방어코드 추가
        }
      });
      const crewId = crewRes.data;
      if (crewId && schedules.length > 0) {
        const schedulePayload = schedules.map((sch, i) => ({ ...sch, sortOrder: i + 1 }));
        await axios.post(`/api/crew-schedules/crew/${crewId}`, schedulePayload, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` }
        });
      }
      alert("🎉 모임이 성공적으로 생성되었습니다!");
      navigate(`/crew/${crewId}`);
    } catch (error) { alert("생성 중 오류가 발생했습니다."); }
  };

  return (
    <div className="crew-create-layout">
      <div className="cc-stepper">
        {["코스 지정", "기본 정보", "모집 설정", "일정 구성"].map((label, idx) => (
          <div key={idx} className={`step ${step === idx + 1 ? "active" : ""} ${step > idx + 1 ? "completed" : ""}`}>
            <div className="step-num">{idx + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="cc-form-container">
        {step === 1 && <CrewStepCourse crewData={crewData} setCrewData={setCrewData} handleInput={handleInput} coursePayload={coursePayload} isMapLoaded={isMapLoaded} setIsMapModalOpen={setIsMapModalOpen} />}
        {step === 2 && <CrewStepBasic crewData={crewData} handleInput={handleInput} imageFiles={imageFiles} setImageFiles={setImageFiles} imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} tags={tags} setTags={setTags} />}
        {step === 3 && <CrewStepRecruit crewData={crewData} setCrewData={setCrewData} handleInput={handleInput} isAgeLimitFree={isAgeLimitFree} setIsAgeLimitFree={setIsAgeLimitFree} />}
        {step === 4 && <CrewStepSchedule schedules={schedules} setSchedules={setSchedules} />}

        <div className="cc-bottom-nav">
          {step > 1 && <button className="btn-prev" onClick={() => setStep(step - 1)}>이전</button>}
          {step < 4 ? <button className="btn-next" onClick={handleNextStep}>다음 단계</button> : <button className="btn-submit" onClick={handleSubmit}>🔥 모임 생성 완료!</button>}
        </div>
      </div>

      {isMapModalOpen && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <button className="btn-modal-close" onClick={() => setIsMapModalOpen(false)}>✕ 닫기</button>
            <CrewMapBuilder
              initialCourseData={coursePayload}
              onSaveCourse={handleSaveCourse}
              predefinedMountain={coursePayload?.mountainName || crewData.mountainName} // 지정된 산있다면 우선넘겨줌
              onClose={() => setIsMapModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewCreate;