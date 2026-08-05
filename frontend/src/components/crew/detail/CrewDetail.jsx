import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { IconMapPin, IconClock, IconCheck } from "../common/CrewIcons";
import "../../../css/crew/crewDetail.css"
import CrewDetailCourse from "./CrewDetailCourse";
import CrewDetailParticipants from "./CrewDetailParticipants";
import CrewDetailSidebar from "./CrewDetailSidebar";
import CrewLoadKakaoMap from "../map/CrewLoadKakaoMap";


// 두 좌표 간의 거리를 미터(m) 단위로 계산
const getDistanceMeter = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; const dLat = ((lat2 - lat1) * Math.PI) / 180; const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 날씨 렌더링
const getWeatherInfo = (code) => {
  if (code === 0) return { text: "맑음", icon: "☀️" };
  if (code === 1 || code === 2 || code === 3) return { text: "구름 조금/흐림", icon: "⛅" };
  if (code === 45 || code === 48) return { text: "안개", icon: "🌫️" };
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return { text: "이슬비", icon: "🌧️" };
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) return { text: "비", icon: "☔" };
  if (code === 71 || code === 73 || code === 75 || code === 77) return { text: "눈", icon: "❄️" };
  if (code === 80 || code === 81 || code === 82) return { text: "소나기", icon: "🌦️" };
  if (code === 95 || code === 96 || code === 99) return { text: "뇌우/폭우", icon: "⛈️" };
  return { text: "알 수 없음", icon: "🌤️" };
};


// CrewDetail(기본뼈대),CrewDetailCourse(코스,일정),CrewDetailParticipants(참여자),CrewDetailSidebar(사이드바)

// 상태관리,데이터통신,탭 렌더링 담당
const CrewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crew, setCrew] = useState(null);
  const [segments, setSegments] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [forecast, setForecast] = useState({ loading: true, data: null, isCurrent: false });
  const [activeTab, setActiveTab] = useState("course");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);  // 카카오맵 완전 로딩 상태 관리

  // Redux와 LocalStorage를 모두 확인하여 로그인 이메일 추출
  const { isUser } = useSelector((state) => state.authSlice) || {};
  const localEmail = localStorage.getItem("userEmail");
  const currentUserEmail = isUser?.userEmail || localEmail;

  useEffect(() => {
    CrewLoadKakaoMap()
      .then(() => setIsMapLoaded(true))
      .catch((err) => console.error("카카오맵 로드 에러:", err));
  }, []);

  // 크루 상세, 일정, 참여자, 날씨, 코스 정보 일괄 조회
  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const res = await axios.get(`/api/crews/${id}`);
        const crewData = res.data;
        setCrew(crewData);

        const schRes = await axios.get(`/api/crew-schedules/crew/${id}`).catch(() => ({ data: [] }));
        setSchedules(schRes.data);

        // 백엔드 API (방장 + 결제 완료자 List 반환)
        const partRes = await axios.get(`/api/crews/${id}/participants`).catch(() => ({ data: [] }));
        setParticipants(partRes.data);


        // 코스 및 등산로 데이터 로직
        if (crewData.customCourseId) {
          const courseRes = await axios.get(`/api/custom-courses/${crewData.customCourseId}`);
          const course = courseRes.data;
          setCourseData(course);

          if (course.separatedSegments?.length > 0) {
            setSegments(course.separatedSegments);
          } else if (course.selectedPath) {
            let parsedPath = typeof course.selectedPath === 'string' ? JSON.parse(course.selectedPath) : course.selectedPath;
            if (parsedPath?.length > 0) {
              let currentSegment = []; let segs = [];
              for (let i = 0; i < parsedPath.length; i++) {
                const p = parsedPath[i];
                if (currentSegment.length > 0) {
                  const lastP = currentSegment[currentSegment.length - 1];
                  const lat1 = lastP.latitude; const lon1 = lastP.longitude;
                  const lat2 = p.latitude; const lon2 = p.longitude;
                  if (getDistanceMeter(lat1, lon1, lat2, lon2) > 100) { segs.push(currentSegment); currentSegment = []; }
                }
                currentSegment.push(p);
              }
              if (currentSegment.length > 0) segs.push(currentSegment);
              setSegments(segs);
            }
          } else if (course.selectedSegments && course.trailId) {
            // 산림청 등산로 정보 바탕으로 Polyline그리기 로직
            try {
              const trailListRes = await axios.get(`/api/trails/mountain/${crewData.mountainId}`);
              const targetCourse = trailListRes.data.find(t => t.trailId === course.trailId);
              if (targetCourse && targetCourse.subCourses) {
                const parsedSegmentsIdx = JSON.parse(course.selectedSegments);
                const exactSegments = parsedSegmentsIdx.map(idx => targetCourse.subCourses[idx].path);
                setSegments(exactSegments);
              }
            } catch (err) { console.error("등산로 복원 실패"); }
          }
        }
      } catch (error) { alert("모임 정보를 불러올 수 없습니다."); navigate(-1); }
    };
    fetchDetailData();
  }, [id, navigate]);

  // 산의 위치기반으로 조회하여 날씨  (오픈메테오 - 키값없이 바로사용가능한 오픈api, 이것만 사용해도 됬을듯..?)
  useEffect(() => {
    if (!crew) return;
    const fetchWeather = async () => {
      try {
        const lat = crew.meetingLat || 37.5665;
        const lon = crew.meetingLng || 126.9780;
        const targetDate = crew.crewStartDate?.split('T')[0];

        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul`;
        const res = await axios.get(meteoUrl);

        const daily = res.data.daily;
        const dateIndex = daily.time.indexOf(targetDate);

        if (dateIndex !== -1) {
          const code = daily.weathercode[dateIndex];
          setForecast({
            loading: false, isCurrent: false,
            data: { ...getWeatherInfo(code), maxTemp: daily.temperature_2m_max[dateIndex], minTemp: daily.temperature_2m_min[dateIndex], rainProb: daily.precipitation_probability_max[dateIndex] }
          });
        } else {
          const backendRes = await axios.get(`/api/weather`, { params: { mountainName: crew.mountainName, lat, lon } });
          setForecast({ loading: false, isCurrent: true, data: backendRes.data });
        }
      } catch (e) {
        setForecast({ loading: false, isCurrent: true, data: null });
      }
    };
    fetchWeather();
  }, [crew]);



  // 크루 수정
  const handleEdit = () => navigate(`/crew/update/${id}`);
  // 크루 삭제 (상태-DELETED변경(soft delete))
  const handleDelete = async () => {
    if (!window.confirm("정말 이 모임을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/crews/${id}`);
      alert("삭제가 완료되었습니다."); navigate("/crew");
    } catch (e) { alert(e.response?.data || "삭제 실패"); }
  };

  // 카카오 내비게이션 연결
  const openNavi = () => window.open(`https://map.kakao.com/link/to/${crew.meetingPlace || '집결지'},${crew.meetingLat},${crew.meetingLng}`, "_blank");

  if (!crew) return <div style={{ textAlign: "center", padding: "100px 0" }}>데이터를 불러오는 중입니다...</div>;

  // 실제 백엔드에서 넘어온 전체 참여자 수 (방장 + 결제자)
  const isHost = crew?.userEmail === currentUserEmail;
  const totalCount = Math.max(participants.length, 1);
  const coverImage = crew.crewFiles?.length > 0 ? `${crew.crewFiles[0].filePath}` : crew.mountainImageUrl || "/images/mountain/no_image.png";

  // 1. 시간 초과 여부 확인
  const isTimePassed = crew.crewDeadline ? new Date(crew.crewDeadline) < new Date() : false;

  // 2. 백엔드 상태값(crewStatus)을 반영
  const isCancelled = crew.crewStatus === "CANCELLED";
  const isClosed = crew.crewStatus === "CLOSED" || (crew.crewStatus === "RECRUITING" && isTimePassed);

  // 3. 블라인드 처리 (어둡게 만들기) 조건
  const isBlind = isClosed || isCancelled;

  // 4. 내가 참여중인 크루인지 판별
  const isJoined = participants.some(p => (p.userEmail || p.memberEmail) === currentUserEmail);

  return (
    <div className="cd-page-wrapper">
      {/* 마감/취소 시 상단 커버에 closed 클래스를 붙여 오버레이 생성 */}
      <div className={`cd-hero-section ${isBlind ? 'closed' : ''}`}>
        <img src={coverImage} alt="커버 이미지" className="cd-hero-img" />
      </div>

      <div className="cd-layout-container">

        {/* 마감/취소 시 메인 콘텐츠 전체 톤 다운 (블라인드) */}
        <div className={`cd-main-content ${isBlind ? 'closed' : ''}`}>
          <div className="cd-meta-top cd-meta-flex">

            <div className="cd-meta-info-group">
              {/* 리스트 페이지와 동일한 최우선 순위 뱃지 렌더링 로직 적용 */}
              <span className={`cd-status ${isCancelled ? "cancelled" : isJoined ? "joined" : isClosed ? "closed" : "active"}`}>
                {isCancelled ? "모집 취소" : isJoined ? <><IconCheck /> 참여중</> : isClosed ? "모집 마감" : "모집중"}
              </span>
              {crew.crewDeadline && (<span className="cd-deadline">마감 {crew.crewDeadline.split('T')[0]}</span>)}
            </div>

            <div className="cd-host-actions">
              <span className="cd-view">조회 {crew.viewCount || 0}</span>
              {/* {isHost && (<><button className="btn-edit" onClick={handleEdit}>수정</button>
              <button className="btn-delete" onClick={handleDelete}>삭제</button></>)} */}
            </div>
          </div>

          <h1 className="cd-title">{crew.crewName}</h1>

          <div className="cd-summary-list">
            <div className="summary-item cd-summary-loc">
              <IconMapPin /> <strong>{crew.mountainName || "장소 미정"}</strong> {crew.meetingPlace && <span> · {crew.meetingPlace} 집결</span>} 
              <button className="btn-loc-navi" onClick={openNavi}>길찾기 ↗</button>
            </div>
            <div className="summary-item">
              <IconClock /> {crew.crewStartDate?.replace("T"," ").replaceAll("-",".").substring(0,16)} 출발
            </div>
          </div>

          <div className="cd-tabs">
            <button className={activeTab === "course" ? "active" : ""} onClick={() => setActiveTab("course")}>코스/일정</button>
            <button className={activeTab === "participants" ? "active" : ""} onClick={() => setActiveTab("participants")}>참여자 ({totalCount}/{crew.crewPeople})</button>
          </div>

          <div className="cd-tab-content">
            {activeTab === "course" && <CrewDetailCourse isMapLoaded={isMapLoaded} totalCount={totalCount} courseData={courseData} crew={crew} segments={segments} schedules={schedules} forecast={forecast} openNavi={openNavi} openImageModal={(src) => { setSelectedImage(src); setIsImageModalOpen(true); }} API_URL='' />}
            {activeTab === "participants" && <CrewDetailParticipants currentUserEmail={currentUserEmail} crewId={crew.id} crewPeople={crew.crewPeople} hostId={crew.memberId} />}
          </div>
        </div>

        {/* 사이드바에 전체 참여자 리스트도 같이 넘겨서 오픈채팅방 입장 권한 체크 */}
        <CrewDetailSidebar crew={crew} totalCount={totalCount} isClosed={isClosed} isHost={isHost} participants={participants} currentUserEmail={currentUserEmail} />
      </div>

      {isImageModalOpen && (
        <div className="image-modal-overlay" onClick={() => setIsImageModalOpen(false)}>
          <button className="image-modal-close" onClick={() => setIsImageModalOpen(false)}>×</button>
          <img src={selectedImage} alt="확대 이미지" className="image-modal-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default CrewDetail;