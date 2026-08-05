import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { regionData } from '../../utils/regionData';
import MountainImg from './MountainImg';
import Pagination from '../../utils/Pagination';
import { Link } from 'react-router-dom';
import '../../css/mountain/mountainList.css';

const MountainList = ({ memberId }) => {
  const [mountains, setMountains] = useState([]);
  const [paging, setPaging] = useState({});
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 한 화면에 보여줄 산의 개수
  const PAGE_SIZE = 9;

  // 검색어 및 지역 필터 상태
  const [filters, setFilters] = useState({
    mountainName: '',
    sido: '',
    sigungu: ''
  });

  // 정렬 기준 상태 (기본: 조회수 내림차순)
  const [sort, setSort] = useState("id,desc");

  // 검색어, 지역, 정렬 상태를 모두 초기화합니다.
  const handleResetFilter = () => {
    setFilters({ mountainName: "", sido: "", sigungu: "" });
    setSort("id,desc");
    setPage(0);
    setIsFilterOpen(false);
  };

  // 조건에 맞춰 백엔드에서 산 목록 데이터를 가져옵니다.
  const fetchMountains = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/mountains/search`, {
        params: {
          memberId: memberId || null,
          mountainName: filters.mountainName,
          sido: filters.sido,
          sigungu: filters.sigungu,
          page: page,
          size: PAGE_SIZE,
          sort: sort
        }
      });

      if (Array.isArray(response.data)) {
        const startIdx = page * PAGE_SIZE;
        const endIdx = startIdx + PAGE_SIZE;
        setMountains(response.data.slice(startIdx, endIdx));
        setPaging({ totalPages: Math.ceil(response.data.length / PAGE_SIZE) });
      } else {
        setMountains(response.data.content);
        setPaging(response.data);
      }
    } catch (error) {
      console.error("산 목록을 불러오는데 실패했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지, 정렬, 필터 조건이 변경될 때마다 데이터를 자동으로 새로 불러옵니다.
  useEffect(() => {
    fetchMountains();
  }, [page, sort, filters.sido, filters.sigungu, memberId]);

  // 메인 검색창에서 엔터 또는 검색 버튼을 눌렀을 때 실행됩니다.
  const handleSearch = () => {
    setPage(0);
    fetchMountains();
  };

  // 시/도 버튼 클릭 시 토글 처리 및 하위 시/군/구를 초기화합니다.
  const handleSidoClick = (selectedSido) => {
    setFilters(prev => ({
      ...prev,
      sido: prev.sido === selectedSido ? '' : selectedSido,
      sigungu: ''
    }));
    setPage(0);
  };

  // 시/군/구 버튼 클릭 시 필터에 적용하거나 해제합니다.
  const handleSigunguClick = (selectedSigungu) => {
    setFilters(prev => ({
      ...prev,
      sigungu: prev.sigungu === selectedSigungu ? '' : selectedSigungu
    }));
    setPage(0);
  };

  return (
    <>
      <div className="mt-inner">
        <div className="mtList-wrapper">
          <div className="mtList-header">
            <h2>등산로 찾기</h2>
            <p>전국의 아름다운 명산과 코스를 확인해보세요.</p>
          </div>
          <div className="mtList-toolbar">
            {/* 직관적이고 넓은 메인 검색창 영역입니다. */}
            <div className="mtList-search-wrap">
              <input
                type="text"
                placeholder="어느 산으로 떠나볼까요?"
                value={filters.mountainName}
                onChange={(e) => setFilters(prev => ({ ...prev, mountainName: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="mtList-search-input"
              />
              <button className="mtList-search-btn" onClick={handleSearch}>검색</button>
            </div>

            {/* 필터 열기, 초기화, 정렬 기능을 모아둔 우측 컨트롤 영역입니다. */}
            <div className="mtList-control-wrap">
              <button className="mtList-filter-toggle" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                {isFilterOpen ? "필터 닫기 ▲" : "지역 필터 ▼"}
              </button>

              <button className="mtList-reset-btn" onClick={handleResetFilter} title="필터 초기화">
                초기화 ↺
              </button>

              <select className="mtList-sort-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
                <option value="id,desc">최신순</option>
                <option value="bookmarkCount,desc">북마크순</option>
                <option value="mountainName,asc">가나다순</option>
              </select>
            </div>
          </div>

          {/* 확장된 지역 필터 영역입니다. */}
          {isFilterOpen && (
            <div className="mtList-filter-area">
              <div className="mtList-region-group">
                <span className="mtList-region-label">시/도</span>
                <div className="mtList-region-chips">
                  {Object.keys(regionData).map(region => (
                    <button
                      key={region}
                      className={`mtList-chip-btn ${filters.sido === region ? 'active' : ''}`}
                      onClick={() => handleSidoClick(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              {filters.sido && regionData[filters.sido] && (
                <div className="mtList-region-group mtList-mt-15">
                  <span className="mtList-region-label">시/군/구</span>
                  <div className="mtList-region-chips">
                    {regionData[filters.sido].map(gugun => (
                      <button
                        key={gugun}
                        className={`mtList-chip-btn mtList-sub-chip ${filters.sigungu === gugun ? 'active' : ''}`}
                        onClick={() => handleSigunguClick(gugun)}
                      >
                        {gugun}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 상황에 따라 로딩 스피너, 빈 결과 화면, 카드 리스트를 분기 렌더링합니다. */}
          {isLoading ? (
            <div className="mtList-loading">데이터를 불러오는 중입니다...</div>
          ) : (
            <>
              <div className="mtList-grid">
                {mountains.map((mt) => (
                    <Link key={mt.id} to={`/mountain/${mt.id}`} className='mt-con-wrap'>
                      <div className="mt-list-img">
                        <MountainImg key={mt.id} mountain={mt} />
                        {mt.height > 0 && (
                          <span className='mt-list-badge'>
                            <b className='mt-list-badge-color'>{mt.height}</b>M
                          </span>
                        )}
                      </div>
                      <div className="mt-list-text">
                        <h3>{mt.mountainName}</h3>
                        <div className="mt-list-location">
                          <b>위치</b>
                          <p>{mt.location}</p>
                        </div>
                      </div>
                    </Link>
                ))}
              </div>

              {mountains.length === 0 && (
                <div className="mtList-empty">검색 결과가 없습니다.</div>
              )}

              {/* 공통 페이징 컴포넌트를 이용해 하단 페이지 네비게이션을 출력합니다. */}
              {paging?.totalPages > 0 && (
                <div className="mtList-pagination-wrap">
                  <Pagination
                    page={page}
                    setPage={setPage}
                    totalPages={paging.totalPages}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </>
  );
};

export default MountainList;