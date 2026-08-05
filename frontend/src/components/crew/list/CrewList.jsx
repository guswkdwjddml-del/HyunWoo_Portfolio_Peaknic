import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; // 현재 로그인한 유저 정보를 가져오기 위해 추가
import "../../../css/crew/crewList.css";
import Pagination from "../../../utils/Pagination";
import MountainVideoBg from "../../mountain/MountainVideoBg";
import CrewCard from "./CrewCard";
import CrewSearchToolbar from "../common/CrewSearchToolbar";
import CrewFilterDetail from "../common/CrewFilterDetail";
import { clearParticipantsCache } from "../../../store/slice/crewSlice";


// 검색 필터 및 리스트의 메인 뼈대를 관리하는 부모 컴포넌트
const CrewList = ({ memberId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [filters, setFilters] = useState({ keyword: "", sido: "", sigungu: "", mountainName: "", isRecruiting: true, isMyJoin: false, tags: [], crewLevel: "" });
  const [sort, setSort] = useState("id,desc");
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const availableTags = ["당일산행", "야간산행", "주말산행", "2030", "4050", "나이무관"];
  const [page, setPage] = useState(0);  // 페이징
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("RECRUITING"); // 상태 탭 관리
  // 상태 정의
  const statusTabs = [
    { id: "ALL", label: "전체" },
    { id: "RECRUITING", label: "모집중" },
    { id: "CLOSED", label: "모집마감" },
    { id: "COMPLETED", label: "산행완료" },
    { id: "CANCELLED", label: "취소" },
  ];

  // Redux와 LocalStorage를 모두 확인하여 현재 로그인한 유저의 이메일 추출
  const { isUser } = useSelector((state) => state.auth) || {};
  const localEmail = localStorage.getItem("userEmail");
  const currentUserEmail = isUser?.userEmail || localEmail;

  // 현재 로그인한 사용자의 ID를 가져옵니다.
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await axios.get(`/api/member/findId`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUserId(response.data.memberId || response.data.id || response.data);
        } catch (error) {
          console.error("사용자 ID 조회를 실패했습니다.", error);
        }
      }
    };
    fetchUserId();
  }, []);

  // 백엔드에서 크루 리스트 기본 데이터 가져오기
  const fetchCrews = async (currentPage = 0) => {
    try {
      // 마이페이지(memberId props)거나 체크박스로 '내 참여 크루'를 선택한 경우 사용할 ID
      const targetMemberId = memberId || (filters.isMyJoin ? currentUserId : null);

      const params = {
        page: currentPage, size: 12, sort: sort,
        keyword: filters.keyword, sido: filters.sido, sigungu: filters.sigungu,
        mountainName: filters.mountainName, crewStatus: activeTab !== "ALL" ? activeTab : "",
        tags: filters.tags.join(","),
        crewLevel: filters.crewLevel,
        ...(targetMemberId ? { memberId: targetMemberId } : {}),
      };
      // targetMemberID있으면 참여중인 크루만, 아니면 전체검색
      const endpoint = targetMemberId ? '/api/crews/myjoincrew' : '/api/crews/search';
      const response = await axios.get(`${endpoint}`, { params });
      setData(response.data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  // 필터, 정렬, 페이지가 변경될 때마다 데이터를 다시 불러옴
  useEffect(() => { dispatch(clearParticipantsCache());}, [location.key]);
  useEffect(() => { setPage(0); fetchCrews(0); }, [filters, sort, memberId, activeTab]);
  useEffect(() => { if (page !== 0) fetchCrews(page); }, [page]);

  // 검색필터 입력값 상태에 반영
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // 비로그인 상태로 참여중인 크루 보기를 체크한 경우 차단
    if (name === "isMyJoin" && checked && !currentUserId) {
      alert("로그인이 필요한 기능입니다.");
      navigate("/auth/login");
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "sido" ? { sigungu: "" } : {})
    }));
  };

  // 태그 선택/해제 상태 토글
  const handleTagToggle = (tag) => {
    setFilters((prev) => {
      const isSelected = prev.tags.includes(tag);
      return { ...prev, tags: isSelected ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] };
    });
  };

  // 크루 만들기
  const handleCreateCrew = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인 후 이용해주세요.");
      navigate("/auth/login");
      return;
    }
    navigate("/crew/create");
  };

  // 검색 버튼 클릭 시 1페이지부터 다시불러옴
  const handleSearch = () => {
    setPage(0);
    fetchCrews(0);
  };

  // 필터상태 초기화
  const handleResetFilter = () => {
    setFilters({ keyword: "", sido: "", sigungu: "", mountainName: "", isMyJoin: false, tags: [], crewLevel: "" });
    setSort("id,desc");
    setActiveTab("ALL"); 
    setPage(0);
    setIsAccordionOpen(false);
  };

  const filteredCrews = data.content.filter((crew) => crew.crewStatus !== "DELETED");

  return (
    <div className="crewList-wrapper">
      <div className="crewList-header">
        <h2>크루 찾기</h2>
        <p>함께 등산할 크루를 찾아보세요.</p>
      </div>

      <MountainVideoBg />

      {/* 툴바 영역 */}
      <CrewSearchToolbar
        filters={filters} sort={sort} isAccordionOpen={isAccordionOpen} memberId={memberId}
        handleInputChange={handleInputChange} handleSearch={handleSearch} handleResetFilter={handleResetFilter}
        setIsAccordionOpen={setIsAccordionOpen} setSort={setSort} setPage={setPage} handleCreateCrew={handleCreateCrew}
      />

      {/* 상세필터 */}
      {isAccordionOpen && (
        <CrewFilterDetail
          filters={filters} availableTags={availableTags}
          handleInputChange={handleInputChange} handleTagToggle={handleTagToggle}
        />
      )}
      <div className="status-tabs">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            className={`status-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="crew-count">총 {filteredCrews.length}건이 검색되었습니다.</div>

      {filteredCrews.length === 0 ? (
        <div className="empty-result">검색 결과가 없습니다.</div>
      ) : (
        <div className="modern-crew-grid">
          {filteredCrews.map((crew) => (
            <CrewCard key={crew.id} crew={crew} currentUserEmail={currentUserEmail} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={data.totalPages}
      />
    </div>
  );
};

export default CrewList;