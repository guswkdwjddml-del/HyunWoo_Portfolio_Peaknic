import React from "react";

const CrewSearchToolbar = ({
  filters, sort, isAccordionOpen, memberId,
  handleInputChange, handleSearch, handleResetFilter,
  setIsAccordionOpen, setSort, setPage, handleCreateCrew
}) => {
  return (
    <div className="crewList-toolbar">
      {/* 텍스트 검색 영역 */}
      <div className="crewList-search-wrap">
        <input
          className="crewList-search-input"
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="검색어를 입력해주세요"
        />
        {/* 검색 실행 버튼 클릭을 처리합니다. */}
        <button className="crewList-search-btn" onClick={handleSearch}>검색</button>
      </div>

      {/* 필터 및 정렬 컨트롤 영역 */}
      <div className="crewList-control-wrap">
        {/* <label className="recruit-check">
          <input type="checkbox" name="isRecruiting" checked={filters.isRecruiting} onChange={handleInputChange} />
          모집중
        </label> */}
        {!memberId && (
          <label className="recruit-check">
            <input type="checkbox" name="isMyJoin" checked={filters.isMyJoin || false} onChange={handleInputChange} />
            참여중
          </label>
        )}
        {/* 아코디언 상태를 토글하여 상세 필터를 열고 닫습니다. */}
        <button className="crewList-filter-toggle" onClick={() => setIsAccordionOpen(!isAccordionOpen)}>
          {isAccordionOpen ? "상세필터 닫기" : "상세필터 열기"}
        </button>
        {/* 필터 설정값을 초기 상태로 되돌립니다. */}
        <button className="crewList-reset-btn" onClick={handleResetFilter} title="필터 초기화">
          초기화
        </button>
        {/* 정렬 기준을 변경하고 첫 페이지로 이동합니다. */}
        <select className="crewList-sort-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
          <option value="id,desc">최신순</option>
          <option value="viewCount,desc">조회순</option>
          <option value="currentPeople,desc">인원순</option>
          <option value="crewDeadline,asc">마감임박순</option>
          <option value="crewLevel,asc">난이도순</option>
        </select>
        {/* 마이페이지가 아닌 일반 목록일 때만 크루 생성 버튼을 표시합니다. */}
        {!memberId && (
          <button className="btn-create-crew" onClick={handleCreateCrew}>크루 생성</button>
        )}
      </div>
    </div>
  );
};

export default CrewSearchToolbar;