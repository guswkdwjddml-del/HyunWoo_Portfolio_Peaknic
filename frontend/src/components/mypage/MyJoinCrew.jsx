import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "../../css/crew/crewList.css";
import Pagination from "../../utils/Pagination";
import MountainVideoBg from "../mountain/MountainVideoBg";
import CrewCard from "../crew/list/CrewCard";
import CrewSearchToolbar from "../crew/common/CrewSearchToolbar";
import CrewFilterDetail from "../crew/common/CrewFilterDetail";


const MyJoinCrew = ({ memberId = null }) => {
  const navigate = useNavigate();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  
  // CrewList와 동일한 필터 구조 사용
  const [filters, setFilters] = useState({ 
    keyword: "", sido: "", sigungu: "", mountainName: "", 
    isRecruiting: true, isMyJoin: true, tags: [], crewLevel: "" 
  });
  const [sort, setSort] = useState("id,desc");
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const availableTags = ["당일산행", "야간산행", "주말산행", "2030", "4050", "나이무관"];
  const [page, setPage] = useState(0);
  
  // 탭 상태 관리 추가 (CrewList와 동일)
  const [activeTab, setActiveTab] = useState("ALL");
  const statusTabs = [
    { id: "ALL", label: "전체" },
    { id: "RECRUITING", label: "모집중" },
    { id: "CLOSED", label: "모집마감" },
    { id: "COMPLETED", label: "산행완료" },
    { id: "CANCELLED", label: "취소" },
  ];

  const { isUser } = useSelector((state) => state.authSlice) || {};
  const localEmail = localStorage.getItem("userEmail");
  const currentUserEmail = isUser?.userEmail || localEmail;

  // 참여한 크루 데이터 페칭
  const fetchCrews = async (currentPage = 0) => {
    try {
      const params = {
        page: currentPage, size: 12, sort: sort,
        keyword: filters.keyword, sido: filters.sido, sigungu: filters.sigungu,
        mountainName: filters.mountainName, isRecruiting: filters.isRecruiting,
        tags: filters.tags.join(","), crewLevel: filters.crewLevel,
        ...(memberId ? { memberId } : {}),
      };
      
      const response = await axios.get(`/api/crews/myjoincrew`, { params });
      setData(response.data);
    } catch (error) {
      console.error("참여 크루 데이터 로딩 실패:", error);
    }
  };

  useEffect(() => { setPage(0); fetchCrews(0); }, [filters, sort, memberId]);
  useEffect(() => { if (page !== 0) fetchCrews(page); }, [page]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value, 
      ...(name === "sido" ? { sigungu: "" } : {}) 
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters((prev) => {
      const isSelected = prev.tags.includes(tag);
      return { ...prev, tags: isSelected ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] };
    });
  };

  const handleSearch = () => {
    setPage(0);
    fetchCrews(0);
  };

  const handleResetFilter = () => {
    setFilters({ keyword: "", sido: "", sigungu: "", mountainName: "", isRecruiting: true, isMyJoin: true, tags: [], crewLevel: "" });
    setSort("id,desc");
    setPage(0);
    setIsAccordionOpen(false);
  };

  // 탭 상태와 삭제 여부를 기준으로 최종 필터링된 배열 생성
  const filteredCrews = data.content
    .filter((crew) => crew.crewStatus !== "DELETED")
    .filter((crew) => activeTab === "ALL" || crew.crewStatus === activeTab);

  return (
    <div className="crewList-wrapper">
      <div className="crewList-header">
        <h2>참여한 크루</h2>
        <p>내가 가입하고 참여한 크루 목록입니다.</p>
      </div>

      <MountainVideoBg />
      
      <CrewSearchToolbar 
        filters={filters} sort={sort} isAccordionOpen={isAccordionOpen} memberId={memberId}
        handleInputChange={handleInputChange} handleSearch={handleSearch} handleResetFilter={handleResetFilter}
        setIsAccordionOpen={setIsAccordionOpen} setSort={setSort} setPage={setPage} handleCreateCrew={() => navigate("/crew/create")}
      />

      {isAccordionOpen && (
        <CrewFilterDetail 
          filters={filters} availableTags={availableTags}
          handleInputChange={handleInputChange} handleTagToggle={handleTagToggle}
        />
      )}

      {/* 상태별 탭 메뉴 UI (CrewList와 동일하게 적용) */}
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
        <div className="empty-result">조회된 크루가 없습니다.</div>
      ) : (
        <div className="modern-crew-grid">
          {filteredCrews.map((crew) => (
            <CrewCard key={crew.id} crew={crew} currentUserEmail={currentUserEmail} />
          ))}
        </div>
      )}
      
      <Pagination page={page} setPage={setPage} totalPages={data.totalPages} />
    </div>
  );
};

export default MyJoinCrew;