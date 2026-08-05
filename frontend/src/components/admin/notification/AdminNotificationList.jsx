import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../utils/Pagination";
import { formatDateTime } from "../../../utils/commonModule";
import AdminNotificationDetailModal from "./AdminNotificationDetailModal";
import "../../../css/notification/AdminNotificationList.css";


const AdminNotificationList = () => {
  const navigate = useNavigate();

  // 'SENT' (발송 내역 관리) | 'INBOX' (특정 회원 수신 조회)
  const [viewMode, setViewMode] = useState("SENT");

  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState(null);

  // 공통 필터
  const [searchType, setSearchType] = useState("ALL");
  const [systemSubType, setSystemSubType] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [readStatus, setReadStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [keyword, setKeyword] = useState("");

  // [INBOX 모드] 특정 회원 검색 관련 상태
  const [inboxRole, setInboxRole] = useState("");
  const [inboxKeyword, setInboxKeyword] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  // 단일 API로 모든 필터 동적 적용 (DTO 맵핑)
  const fetchData = async (currentPage = 0) => {
    setIsLoading(true);
    const isReadParam =
      readStatus === "read" ? true : readStatus === "unread" ? false : null;

    try {
      if (viewMode === "INBOX" && !selectedMember) {
        setNotices([]);
        setTotalPages(0);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        `/api/admin/notification/list`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          params: {
            page: currentPage,
            size: 10,
            searchType: searchType,
            notificationType: searchType === "SYSTEM" ? systemSubType : null,
            role: roleFilter || null,
            isRead: isReadParam,
            startDate: startDate || null,
            endDate: endDate || null,
            searchField: searchField,
            keyword: keyword || null,
            memberId: viewMode === "INBOX" ? selectedMember.id : null,
          },
        },
      );
      setNotices(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("내역 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 회원 검색 메서드
  const handleMemberSearch = async () => {
    if (!inboxKeyword.trim() && !inboxRole) {
      alert("검색어 또는 권한을 선택해주세요.");
      return;
    }
    try {
      const res = await axios.get(
        `/api/admin/notification/members/search`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          params: { keyword: inboxKeyword, role: inboxRole || null },
        },
      );
      setMemberSearchResults(res.data);
      if (res.data.length === 0) alert("검색된 회원이 없습니다.");
    } catch (err) {
      console.error(err);
      alert("회원 검색 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    setPage(0);
    if (viewMode === "SENT" || selectedMember) fetchData(0);
  }, [
    viewMode,
    searchType,
    systemSubType,
    roleFilter,
    readStatus,
    startDate,
    endDate,
    selectedMember,
  ]);

  useEffect(() => {
    if (page !== 0) fetchData(page);
  }, [page]);

  const handleSearch = () => {
    setPage(0);
    fetchData(0);
  };

  const handleReset = () => {
    setSearchType("ALL");
    setSystemSubType("");
    setRoleFilter("");
    setReadStatus("");
    setStartDate("");
    setEndDate("");
    setSearchField("title");
    setKeyword("");
    setPage(0);
  };

  return (
    <div className="admin-noti-container">
      {/* 상단 헤더 & 탭 전환 버튼 */}
      <div className="admin-noti-header">
        <div className="admin-header-tabs">
          <button
            className={`admin-tab-btn ${viewMode === "SENT" ? "active" : ""}`}
            onClick={() => setViewMode("SENT")}
          >
            발송 내역 관리
          </button>
          <button
            className={`admin-tab-btn ${viewMode === "INBOX" ? "active" : ""}`}
            onClick={() => {
              setViewMode("INBOX");
              setSelectedMember(null);
              handleReset();
            }}
          >
            특정 회원 수신 조회
          </button>
        </div>
        <button
          className="admin-noti-send-btn"
          onClick={() => navigate("/admin/notification/write")}
        >
          + 알림 발송
        </button>
      </div>

      {/* 필터 패널 */}
      <div className="admin-noti-filter-panel">
        {/* INBOX 모드일 때만 보이는 회원 검색 영역 */}
        {viewMode === "INBOX" && (
          <div className="inbox-search-section">
            <div className="filter-row">
              <select
                value={inboxRole}
                onChange={(e) => setInboxRole(e.target.value)}
              >
                <option value="">모든 권한</option>
                <option value="JUNIOR">JUNIOR</option>
                {/* <option value="MEMBER">MEMBER</option> */}
                <option value="HOST">HOST</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <input
                type="text"
                placeholder="회원 이름, 이메일, ID 검색"
                value={inboxKeyword}
                onChange={(e) => setInboxKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleMemberSearch()}
              />
              <button
                className="filter-search-btn"
                onClick={handleMemberSearch}
              >
                회원 찾기
              </button>
            </div>

            {memberSearchResults.length > 0 && !selectedMember && (
              <div className="member-search-results">
                <p>검색된 회원 (선택해주세요):</p>
                {memberSearchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setMemberSearchResults([]);
                    }}
                    className="member-result-item"
                  >
                    <span>
                      [{m.role}] <strong>{m.userName}</strong> ({m.userEmail}) -
                      ID: {m.id}
                    </span>
                    <span className="select-arrow">선택 ➔</span>
                  </div>
                ))}
              </div>
            )}

            {selectedMember && (
              <div className="selected-member-banner">
                <div>
                  조회 회원:{" "}
                  <strong>
                    {selectedMember.userName} ({selectedMember.userEmail})
                  </strong>{" "}
                  [ID: {selectedMember.id}]
                </div>
                <button
                  className="member-change-btn"
                  onClick={() => setSelectedMember(null)}
                >
                  회원 변경
                </button>
              </div>
            )}
          </div>
        )}

        {/* 공통 필터 영역 (SENT 모드이거나, INBOX 모드에서 회원이 선택된 경우에만 노출) */}
        {(viewMode === "SENT" || (viewMode === "INBOX" && selectedMember)) && (
          <>
            <div className="filter-row">
              <div className="admin-noti-tabs">
                {["ALL", "ADMIN_NOTICE", "SYSTEM"].map((type) => (
                  <button
                    key={type}
                    className={`admin-tab-sub-item ${searchType === type ? "active" : ""}`}
                    onClick={() => {
                      setSearchType(type);
                      setSystemSubType("");
                      setPage(0);
                    }}
                  >
                    {type === "ALL"
                      ? "전체"
                      : type === "ADMIN_NOTICE"
                        ? "관리자"
                        : "시스템"}
                  </button>
                ))}
              </div>
            </div>

            <div className="sub-filter-row">
              {searchType === "SYSTEM" && (
                <select
                  className="system-sub-select"
                  value={systemSubType}
                  onChange={(e) => {setSystemSubType(e.target.value);setPage(0);}}
                >
                  <option value="">시스템 종류 전체</option>
                  <option value="CREW">크루</option>
                  <option value="PAYMENT">결제</option>
                  <option value="BOARD">게시판</option>
                  <option value="MOUNTAIN">산</option>
                  <option value="WEATHER">날씨</option>
                  <option value="CART">장바구니</option>
                  <option value="ADMIN">시스템</option>
                  <option value="MEMBER">회원</option>
                  <option value="REVIEW">후기</option>
                  <option value="NOTICE">공지</option>
                  <option value="COMMENT">댓글</option>
                </select>
              )}

              <div className="date-picker-group">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(0);
                  }}
                />
                <span>~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
            </div>

            <div className="filter-row">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">권한 전체</option>
                <option value="HOST">HOST</option>
                <option value="MEMBER">MEMBER</option>
                <option value="JUNIOR">JUNIOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="title">제목</option>
                <option value="message">내용</option>
                <option value="memberId">회원ID</option>
                <option value="email">이메일</option>
                <option value="name">이름</option>
              </select>

              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="filter-search-btn" onClick={handleSearch}>
                검색
              </button>
              <button
                type="button"
                className="filter-reset-btn"
                onClick={handleReset}
              >
                필터 초기화
              </button>
            </div>
          </>
        )}
      </div>

      {/* 목록 렌더링 영역 */}
      <div className="admin-noti-list">
        {isLoading ? (
          <div className="admin-noti-empty">데이터를 불러오는 중입니다...</div>
        ) : viewMode === "INBOX" && !selectedMember ? (
          <div className="admin-noti-empty">
            🔍 상단에서 조회를 원하시는 회원을 검색하고 선택해주세요.
          </div>
        ) : notices.length === 0 ? (
          <div className="admin-noti-empty">발송된 알림 내역이 없습니다.</div>
        ) : (
          notices.map((noti) => (
            <div
              key={noti.id}
              className="admin-noti-card"
              onClick={() => setSelectedNoti(noti)}
            >
              <div className="card-content-area">
                <div className="card-meta-row">
                  <span
                    className={`noti-type-badge ${noti.notificationType === "ADMIN_NOTICE" ? "admin" : "system"}`}
                  >
                    {noti.notificationType === "ADMIN_NOTICE"
                      ? "관리자"
                      : noti.notificationType}
                  </span>
                  <h3 className="card-title">{noti.title}</h3>
                </div>
                <p className="card-desc">{noti.message}</p>
                <span className="card-date">
                  {formatDateTime(noti.createTime)}
                </span>
              </div>

              <div className="card-stats-box">
                <div className="stat-item">
                  <div className="stat-label">발송대상</div>
                  <div className="stat-value">{noti.role || "전체"}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">알림유형</div>
                  <div className="stat-value highlight">
                    {noti.notificationType}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 및 모달 */}
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      <AdminNotificationDetailModal
        isOpen={!!selectedNoti}
        onClose={() => setSelectedNoti(null)}
        noti={selectedNoti}
      />
    </div>
  );
};

export default AdminNotificationList;