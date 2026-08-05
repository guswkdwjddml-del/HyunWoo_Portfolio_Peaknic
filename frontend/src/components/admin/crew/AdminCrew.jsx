import React, { lazy, Suspense, useEffect, useState } from 'react'
import AdminCrewModal from './AdminCrewModal';
import axios from 'axios';
import { formatDateTime } from '../../../utils/commonModule';
import AdminPagination from '../common/AdminPagination';
import { adminListConfig } from '../../../js/adminListConfig';
import AdminSearchBar from '../common/AdminSearchBar';
import AdminCrewSettlementModal from './AdminCrewSettlementModal';

const AdminCrewCreate = lazy(() => import('../crew/AdminCrewCreate'));

const crewStatusMap = {
  RECRUITING: "모집중",
  CLOSED: "마감",
  COMPLETED: "완료",
  DELETED: "삭제",
  CANCELLED: "취소",
};

const AdminCrew = () => {

  const config = adminListConfig.crew;

  const [crewList, setCrewList] = useState([]);
  const [paging, setPaging] = useState({});
  const [page, setPage] = useState(0);
  const [subject, setSubject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("");
  const [filters, setFilters] = useState({ isRecruiting: false });

  const crewListFn = async () => {
    try {
      const params = {
        page,
        size: 8,
        sort,
      };

      if (filters.isRecruiting) {
        params.crewStatus = "RECRUITING";
      }
      
      if (subject === "keyword") {
        params.keyword = searchText;
      }

      if (subject === "mountainName") {
        params.mountainName = searchText;
      }

      const res = await axios.get(
        `/admin/crew`,
        { params }
      );

      setCrewList(res.data.content);
      setPaging(res.data);
      console.log(res.data);

    } catch (error) {
      console.error(error);
      console.log(error.response);
      console.log(error.response?.status);
      console.log(error.response?.data);
    }
  }

  useEffect(() => {
    crewListFn();                  //검색어 작성과 동시에 리스트 정렬
  }, [page, sort, filters, subject, searchText]);

  // 현재 0페이지 → 바로 검색
  // 현재 2페이지 → 0페이지로 이동하면서 useEffect 실행
  const searchFn = () => { if (page === 0) { crewListFn() } else { setPage(0) } };

  // 페이지 및 검색/정렬config 초기화
  useEffect(() => {
    setSubject(config?.searchFields?.[0]?.value ?? "");
    setSort(config?.sortFields?.[0]?.value ?? "");
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // crewModal(회원 추가/수정/상세보기) 구현
  const [openCrewModal, setOpenCrewModal] = useState(false);
  const [crewId, setCrewId] = useState(null);
  const [crewInfo, setCrewInfo] = useState(null);

  const crewModalFn = async (id) => {

    setCrewId(id);

    try {
      const res = await axios.get(
        `/api/crews/${id}`
      );
      setCrewInfo(res.data);
      setOpenCrewModal(true);
    } catch (error) {
      console.error(error);
    }
  }

  // settlemtnModal(정산관리 상세보기) 구현
  const [openSettlementModal, setOpenSettlementModal] = useState(false);
  const [crewSettleInfo, setCrewSettleInfo] = useState(null);

  const settlementModalFn = async (id) => {

    setCrewId(id);

    try {
      const res = await axios.get(
        `/admin/crew/settlement/${id}`
      );
      setCrewSettleInfo(res.data);
      setOpenSettlementModal(true);
    } catch (error) {
      console.error(error);
    }
  }

  // 크루 마감 날짜까지 얼마나 남았는지 구하는 함수
  const deadlineLeftFn = (deadline) => {

    // deadline 값이 없으면 공백 return
    if (!deadline) return "";

    // 현재 시간 기준으로 마감까지 얼마나 남았는지 계산 (ms 단위)
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    // 마감
    if (diff <= 0) return "(마감)";

    // 총 몇분/몇시간인지 계산
    const totalMinutes = Math.floor(diff / (1000 * 60));
    const totalHours = Math.floor(diff / (1000 * 60 * 60));

    // 며칠 몇시간 몇분 남았는지 계산
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;

    if (days >= 1) {
      return `(-${days}일)`;
    } else if (totalHours >= 1) {
      // 24시간 미만
      if (minutes === 0) return `(-${hours}:00)`;
      return `(-${hours}:${minutes})`;
    } else {
      // 60분 미만
      return `(-00:${minutes})`;
    }
  }

  // 정산 처리(정산대기 상태인건 목록에서 바로 정산완료하기)
  const settlementCompleteFn = async (crewId) => {
    if (!window.confirm("결제금액 정산을 확정하시겠습니까?")) {
      return;
    }

    try {
      // 크루 정산 정보 조회
      const res = await axios.get(
        `/admin/crew/settlement/${crewId}`
      );
      const settlementId = res.data.settlementId;
      if (!settlementId) {
        alert("정산 정보가 없습니다.");
        return;
      }

      // 정산 완료 처리
      await axios.post(
        `/admin/crew/settlement/${settlementId}`
      );
      alert("정산 완료 처리되었습니다.");
      crewListFn();
    } catch (error) {
      console.error(error);
      alert("정산 처리 중 오류가 발생했습니다.");
    }
  };

  // 모임등록 화면 보이기
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="adminCrew">
      {
        showCreate
          ?
          <Suspense fallback={<div>Loading...</div>}>
            <AdminCrewCreate
              onClose={() => setShowCreate(false)}
            />
          </Suspense>
          :
          <>
            <div className="adminList">
              <div className="adminList-wrap">
                <div className="adminList-title">
                  <h1>크루목록</h1>

                  {/* 검색/정렬 */}
                  <AdminSearchBar
                    searchFields={config?.searchFields ?? []}
                    sortFields={config?.sortFields ?? []}
                    subject={subject}
                    setSubject={setSubject}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    sort={sort}
                    setSort={setSort}
                    onSearch={searchFn}
                  />
                </div>

                {/* 상단 툴바 */}
                <div className="adminList-toolbar">
                  <div className="adminList-count">
                    총 {paging?.totalElements}건의 크루가 있습니다.
                  </div>

                  <div className="right-wrap">
                    <label className="adminList-check">
                      <input type="checkbox" name="isRecruiting"
                        checked={filters.isRecruiting}
                        onChange={handleInputChange} />
                      모집중
                    </label>

                    {/* 모임등록 화면 보이기 버튼 */}
                    <div className="admin-write-btn">
                      <button onClick={() => setShowCreate(true)}>크루등록</button>
                    </div>
                  </div>
                </div>

                {/* 조회목록 */}
                <div className="adminList-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>크루명</th>
                        <th>참가비</th>
                        <th>참여인원</th>
                        {/* <th>마감일</th> */}
                        <th>D-day(마감)</th>
                        <th>출발일</th>
                        <th>상태</th>
                        <th>크루장(ID)</th>
                        <th>산이름</th>
                        {/* <th>난이도</th> */}
                        <th>상세보기</th>
                        <th>비용정산</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crewList && crewList.map((crew) => {
                        return (
                          <tr         //리스트의 특정 행 클릭시 모달Fn 실행되도록
                            key={crew.id}
                          // onClick={(e) => {
                          //   e.stopPropagation();
                          //   crewModalFn(crew.id);
                          // }}
                          >
                            <td>{crew.id}</td>
                            <td>{crew.crewName}</td>
                            <td>{crew.crewPrice?.toLocaleString()}</td>
                            <td>{crew.currentPeople}/{crew.crewPeople}</td>
                            {/* <td>{formatDateTime(crew.crewDeadline)}</td> */}
                            <td>{deadlineLeftFn(crew.crewDeadline)}</td>
                            <td>{formatDateTime(crew.crewStartDate)}</td>
                            <td>{crewStatusMap[crew.crewStatus] ?? crew.crewStatus}</td>
                            <td>{crew.memberId}</td>
                            <td>{crew.mountainName}</td>
                            {/* <td>{crew.crewLevel}</td> */}
                            <td>
                              <button
                                type="button"
                                className="btn-detail"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  crewModalFn(crew.id);
                                }}
                              >
                                보기
                              </button>
                            </td>
                            <td>
                              {
                                crew.settlementStatus ? (
                                  <button
                                    type="button"
                                    className="btn-settlement"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      settlementModalFn(crew.id)
                                    }}
                                  >
                                    {
                                      crew.settlementStatus === "COMPLETED"
                                        ? "정산완료"
                                        : "정산대기"
                                    }
                                  </button>
                                ) : (
                                  "-"
                                )
                              }

                              {
                                crew.settlementStatus === "PENDING" && (
                                  <button
                                    type="button"
                                    className="btn-settlement-action"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      settlementCompleteFn(crew.id);
                                    }}
                                  >
                                    정산하기
                                  </button>
                                )
                              }
                            </td>
                          </tr>
                        )
                      }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이징 처리 */}
                <AdminPagination
                  page={page}
                  setPage={setPage}
                  totalPages={paging.totalPages}
                  blockSize={5}
                />

                {/* crewModal 창닫기 */}
                {
                  openCrewModal &&
                  <AdminCrewModal          //crewModal로 넘겨줄 data
                    crewId={crewId}
                    crewInfo={crewInfo}
                    onClose={() => setOpenCrewModal(false)}
                    crewListFn={crewListFn}
                  />
                }

                {/* settlementModal 창닫기 */}
                {
                  openSettlementModal &&
                  <AdminCrewSettlementModal          //settlementModal 넘겨줄 data
                    crewId={crewId}
                    crewSettleInfo={crewSettleInfo}
                    onClose={() => setOpenSettlementModal(false)}
                    crewListFn={crewListFn}
                  />
                }
              </div>
            </div>
          </>
      }
    </div>
  )
}

export default AdminCrew