import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CrewStepBasic from "./create/CrewStepBasic";
import CrewStepCourse from "./create/CrewStepCourse";
import CrewStepRecruit from "./create/CrewStepRecruit";
import CrewStepSchedule from "./create/CrewStepSchedule";
import CrewMapBuilder from "./map/CrewMapBuilder";
import "../../css/crew/crewCreate.css"; // Create의 CSS 재사용 (오염 없음)
import CrewLoadKakaoMap from "./map/CrewLoadKakaoMap";

// CrewCreate와 동일한구조,동일컴포넌트 임포트, 상태값만 불러오기
const CrewUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isAgeLimitFree, setIsAgeLimitFree] = useState(false);

  const [crewData, setCrewData] = useState({
    crewName: "", crewDetail: "", crewPeople: 2, minPeople: 1, crewPrice: 0,
    minAge: 20, maxAge: 50, crewLevel: "초보",
    crewStartDate: "", crewEndDate: "", crewDeadline: "",
    meetingPlace: "", meetingLat: null, meetingLng: null, chatLink: "",
    mountainId: null, mountainName: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tags, setTags] = useState([]);
  const [coursePayload, setCoursePayload] = useState(null);
  const [schedules, setSchedules] = useState([]);

  // step 값이 변경될 때마다 동작 (step1 -> step2 -> ,,, 스크롤 맨위로)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // 카카오맵 로딩
  useEffect(() => {
    CrewLoadKakaoMap()
      .then(() => setIsMapLoaded(true))
      .catch((err) => console.error("카카오맵 로드 에러:", err));
  }, []);

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchCrewData = async () => {
      try {
        const [crewRes, schRes] = await Promise.all([
          axios.get(`/api/crews/${id}`),
          axios.get(`/api/crew-schedules/crew/${id}`).catch(() => ({ data: [] }))
        ]);
        const data = crewRes.data;

        setCrewData({
          crewName: data.crewName || "", crewDetail: data.crewDetail || "",
          crewPeople: data.crewPeople || 2, minPeople: data.minPeople || 1, crewPrice: data.crewPrice || 0,
          minAge: data.minAge || "", maxAge: data.maxAge || "", crewLevel: data.crewLevel || "초보",
          crewStartDate: data.crewStartDate ? data.crewStartDate.substring(0, 16) : "",
          crewEndDate: data.crewEndDate ? data.crewEndDate.substring(0, 16) : "",
          crewDeadline: data.crewDeadline ? data.crewDeadline.substring(0, 16) : "",
          meetingPlace: data.meetingPlace || "", meetingLat: data.meetingLat, meetingLng: data.meetingLng,
          chatLink: data.chatLink || "", mountainId: data.mountainId, mountainName: data.mountainName,
          customCourseId: data.customCourseId
        });

        // 연령 제한 없음 체크
        if (!data.minAge && !data.maxAge) setIsAgeLimitFree(true);
        if (data.tags) setTags(data.tags.split(",").filter(Boolean));

        if (schRes.data && schRes.data.length > 0) {
          setSchedules(schRes.data.map(sch => ({ scheduleTime: sch.scheduleTime?.substring(0, 5) || "", title: sch.title || "", description: sch.description || "" })));
        }

        if (data.crewFiles?.length > 0) {
          const files = data.crewFiles.map(f => ({ url: `${f.filePath}`, id: f.id }));
          setExistingImages(files);
          setImagePreviews(files.map(f => f.url));
        }

        if (data.customCourseId) {
          const courseRes = await axios.get(`/api/custom-courses/${data.customCourseId}`);
          const cData = courseRes.data;

          //문자열 좌표를 객체 배열로 파싱
          let parsedPath = [];
          if (cData.selectedPath) {
            const tempPath = typeof cData.selectedPath === 'string'
              ? JSON.parse(cData.selectedPath)
              : cData.selectedPath;
            // 좌표맞추기위해 세팅 (latitude,longitude가 맞다)
            parsedPath = tempPath.map(p => ({
              latitude: Number(p.latitude ?? p.lat),
              longitude: Number(p.longitude ?? p.lng ?? p.lon),
              lat: Number(p.latitude ?? p.lat),
              lng: Number(p.longitude ?? p.lng ?? p.lon)
            }));
          }
          let parsedSegments = [];

          if (cData.selectedSegments) {
            parsedSegments =
              typeof cData.selectedSegments === "string"
                ? JSON.parse(cData.selectedSegments)
                : cData.selectedSegments;
          }

          // 변환된 배열을 덮어씌워 하위 컴포넌트(미니맵, 모달맵)가 에러 없이 선을 그리게 만듭니다.
          setCoursePayload({
            ...cData,
            mountainId: data.mountainId,
            mountainName: data.mountainName,
            selectedPath: parsedPath,
            separatedSegments: [parsedPath],
            selectedSegments: parsedSegments,
            startLng: cData.startLon,
            endLng: cData.endLon,
          });
        }
        await new Promise(resolve => setTimeout(resolve, 0));
        setIsLoading(false);

      } catch (error) {
        alert("기존 모임 정보를 불러오는데 실패했습니다.");
        navigate(-1);
      }
    };
    fetchCrewData();
  }, [id, navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (["crewPeople", "minPeople", "crewPrice", "minAge", "maxAge"].includes(name) && value !== "" && Number(value) < 0) return;
    setCrewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCourse = (savedCourse, mountainId) => {
    setCoursePayload({ ...savedCourse, mountainId });
    setCrewData((prev) => ({ ...prev, meetingLat: savedCourse.startLat || prev.meetingLat, meetingLng: savedCourse.startLon || savedCourse.startLng || prev.meetingLng }));
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
      if (!crewData.crewStartDate || !crewData.crewEndDate || !crewData.crewDeadline) return alert("모집 및 등산(시작/종료) 일정을 모두 달력에 지정해주세요.");

      const start = new Date(crewData.crewStartDate);
      const end = new Date(crewData.crewEndDate);
      const deadline = new Date(crewData.crewDeadline);

      if (deadline >= start) return alert("🚨 논리 오류: 모집 마감 일시는 등산 시작 시간보다 무조건 빨라야 합니다.");
      if (start >= end) return alert("🚨 논리 오류: 등산 종료 일시는 등산 시작 시간 이후여야 합니다.");
    }
    setStep(step + 1);
  };

  // 최종적으로 수정된 폼 데이터와 코스 ID를 취합하여 백엔드에 업데이트를 요청합니다.
  const handleSubmit = async () => {
    const formData = new FormData();
    Object.keys(crewData).forEach((key) => {
      if (isAgeLimitFree && (key === "minAge" || key === "maxAge")) return;
      const val = crewData[key];
      if (val !== null && val !== undefined && val !== "") formData.append(key, val);
    });
    if (tags.length > 0) formData.append("tags", tags.join(","));

    // 새 파일
    imageFiles.forEach(file => {
      formData.append("files", file);
    });

    // 유지할 기존 파일 id
    existingImages.forEach(img => {
      formData.append("keepFile", img.id);
    });

    const finalCourseId = coursePayload?.customCourseId || coursePayload?.id || crewData.customCourseId;
    if (finalCourseId) formData.append("customCourseId", finalCourseId);

    try {
      await axios.put(`/api/crews/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (schedules.length > 0) {
        const schedulePayload = schedules.map((sch, i) => ({ ...sch, sortOrder: i + 1 }));
        await axios.post(`/api/crew-schedules/crew/${id}`, schedulePayload);
      }
      alert("🎉 모임 정보가 성공적으로 수정되었습니다!");
      navigate(`/crew/${id}`);
    } catch (error) { alert("수정 중 오류가 발생했습니다."); }
  };

  if (isLoading) return <div style={{ textAlign: "center", padding: "100px 0" }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="crew-create-layout">
      <div className="cc-stepper">
        {["코스/집결지 수정", "기본 정보 수정", "모집 설정", "일정 수정"].map((label, idx) => (
          <div key={idx} className={`step ${step === idx + 1 ? "active" : ""} ${step > idx + 1 ? "completed" : ""}`}>
            <div className="step-num">{idx + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="cc-form-container">
        {/* Create의 자식 컴포넌트들을 완벽하게 재사용 */}
        {step === 1 && <CrewStepCourse crewData={crewData} setCrewData={setCrewData} handleInput={handleInput} coursePayload={coursePayload} isMapLoaded={isMapLoaded} setIsMapModalOpen={setIsMapModalOpen} />}
        {step === 2 && <CrewStepBasic crewData={crewData} handleInput={handleInput} imageFiles={imageFiles} setImageFiles={setImageFiles} imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} tags={tags} setTags={setTags} existingImages={existingImages} setExistingImages={setExistingImages} />}
        {step === 3 && <CrewStepRecruit crewData={crewData} setCrewData={setCrewData} handleInput={handleInput} isAgeLimitFree={isAgeLimitFree} setIsAgeLimitFree={setIsAgeLimitFree} />}
        {step === 4 && <CrewStepSchedule schedules={schedules} setSchedules={setSchedules} />}

        <div className="cc-bottom-nav">
          {step > 1 ? <button className="btn-prev" onClick={() => setStep(step - 1)}>이전</button> : <button className="btn-prev" onClick={() => navigate(-1)}>수정 취소</button>}
          {step < 4 ? <button className="btn-next" onClick={handleNextStep}>다음 단계</button> : <button className="btn-submit" onClick={handleSubmit}>💾 수정 완료하기!</button>}
        </div>
      </div>

      {isMapModalOpen && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <button className="btn-modal-close" onClick={() => setIsMapModalOpen(false)}>✕ 닫기</button>
            <CrewMapBuilder
              initialCourseData={coursePayload} // DB에서 가져온 코스경로 지도위 뿌리기 (좌표selectedPath 포함)
              predefinedMountain={coursePayload?.mountainName || crewData.mountainName} // 기존 저장된 산이름//코스 데이터 넘겨주기
              onSaveCourse={handleSaveCourse}
              onClose={() => setIsMapModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewUpdate;