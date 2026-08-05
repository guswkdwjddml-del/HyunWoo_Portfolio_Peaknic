import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Pagination from "../../utils/Pagination";
import { formatDateTime } from "../../utils/commonModule";
import { useStomp } from "../../js/useStomp";
import { readNoticeGlobal, readAllNoticesGlobal } from "../../store/slice/notificationSlice";
import "../../css/notification/myNotification.css";
import NotificationDetail from "../notification/NotificationDetail";


const MyNotification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 필터 상태
  const [searchType, setSearchType] = useState("ALL"); // "ALL", "ADMIN_NOTICE", "SYSTEM"
  const [subType, setSubType] = useState("");          // 🌟 시스템 알림 세부 타입 (CREW, PAYMENT 등)
  const [readFilter, setReadFilter] = useState("ALL"); // "ALL", "UNREAD", "READ"

  const { realtimeNotice } = useStomp();

  const fetchNotifications = async () => {
    setIsLoading(true);
    
    const isReadParam = readFilter === "UNREAD" ? false : readFilter === "READ" ? true : null;

    try {
      const response = await axios.get(`/api/notification`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        params: { 
          page, 
          size: 10,
          searchType: searchType,
          notificationType: searchType === "SYSTEM" && subType ? subType : null, // 🌟 시스템 알림일 때만 세부 타입 전송
          isRead: isReadParam
        },
      });
      const safeData = response.data.content.map((n) => ({
        ...n,
        isRead: n.read !== undefined ? n.read : n.isRead,
      }));
      setNotifications(safeData);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("알림 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, searchType, subType, readFilter]);

  useEffect(() => {
    if (realtimeNotice) {
      if (page === 0) fetchNotifications();
      else setPage(0);
    }
  }, [realtimeNotice]);

  const handleItemClick = async (noti) => {
    if (!noti.isRead) {
      try {
        await axios.patch(`/api/notification/${noti.id}/read`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        dispatch(readNoticeGlobal(noti.id));
        fetchNotifications();
      } catch (err) {
        console.error(err);
      }
    }

    if (noti.notificationType === "ADMIN_NOTICE") {
      setSelectedNoti(noti);
    } else if (noti.relatedUrl) {
      if (noti.relatedUrl.startsWith("http://") || noti.relatedUrl.startsWith("https://")) {
        window.open(noti.relatedUrl, "_blank");
      } else {
        navigate(noti.relatedUrl);
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("이 알림을 완전히 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/notification/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  const handleReadAll = async () => {
    try {
      await axios.patch(`/api/notification/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setPage(0);
      fetchNotifications();
      dispatch(readAllNoticesGlobal());
    } catch (error) {
      console.error("전체 읽음 처리 실패:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("모든 알림을 삭제하시겠습니까? (복구할 수 없습니다)")) return;
    try {
      await axios.delete(`/api/notification`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setPage(0);
      fetchNotifications();
    } catch (error) {
      console.error("전체 삭제 실패:", error);
    }
  };

  return (
    <div className="info_page_wrap">
      <div className="mypage_page_title mynoti-title-flex" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2>알림 내역</h2>
          <div className="mynoti-btn-group">
            <button className="mynoti-btn read-all" onClick={handleReadAll}>모두 읽음</button>
            <button className="mynoti-btn delete-all" onClick={handleDeleteAll}>전체 삭제</button>
          </div>
        </div>

        {/* 필터 그룹 UI */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="mynoti-filter-group">
            <button className={`mynoti-filter ${searchType === "ALL" ? "active" : ""}`} onClick={() => { setSearchType("ALL"); setSubType(""); setPage(0); }}>전체 알림</button>
            <button className={`mynoti-filter ${searchType === "ADMIN_NOTICE" ? "active" : ""}`} onClick={() => { setSearchType("ADMIN_NOTICE"); setSubType(""); setPage(0); }}>관리자 알림</button>
            <button className={`mynoti-filter ${searchType === "SYSTEM" ? "active" : ""}`} onClick={() => { setSearchType("SYSTEM"); setPage(0); }}>시스템 알림</button>
          </div>

          {/* 🌟 시스템 알림 선택 시 옆에 노출되는 세부 타입 드롭다운 */}
          {searchType === "SYSTEM" && (
            <select 
              value={subType} 
              onChange={(e) => { setSubType(e.target.value); setPage(0); }}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', fontSize: '14px' }}
            >
              <option value="">모든 시스템 타입</option>
              <option value="CREW">크루 (CREW)</option>
              <option value="PAYMENT">결제 (PAYMENT)</option>
              <option value="BOARD">자유게시판 (BOARD)</option>
              <option value="MOUNTAIN">산 정보 (MOUNTAIN)</option>
              <option value="WEATHER">날씨 (WEATHER)</option>
              <option value="CART">장바구니 (CART)</option>
              <option value="ADMIN">관리자 편의 (ADMIN)</option>
              <option value="MEMBER">회원 (MEMBER)</option>
              <option value="REVIEW">리뷰 (REVIEW)</option>
              <option value="NOTICE">공지사항 (NOTICE)</option>
              <option value="COMMENT">댓글 (COMMENT)</option>
            </select>
          )}

          <div className="mynoti-filter-group">
            <button className={`mynoti-filter ${readFilter === "ALL" ? "active" : ""}`} onClick={() => { setReadFilter("ALL"); setPage(0); }}>전체 상태</button>
            <button className={`mynoti-filter ${readFilter === "UNREAD" ? "active" : ""}`} onClick={() => { setReadFilter("UNREAD"); setPage(0); }}>안 읽음</button>
            <button className={`mynoti-filter ${readFilter === "READ" ? "active" : ""}`} onClick={() => { setReadFilter("READ"); setPage(0); }}>읽음</button>
          </div>
        </div>
      </div>

      <div className="step_content_area mynoti-content-box">
        {isLoading ? (
          <div className="mynoti-empty">알림을 불러오는 중...</div>
        ) : notifications.length === 0 ? (
          <div className="mynoti-empty">해당 조건의 알림이 없습니다.</div>
        ) : (
          <div className="mynoti-list-container">
            {notifications.map((noti) => (
              <div key={noti.id} onClick={() => handleItemClick(noti)} className={`mynoti-item ${noti.isRead ? "read" : "unread"}`}>
                <div className="mynoti-info-col">
                  <div className="mynoti-header-row">
                    {!noti.isRead && <span className="mynoti-badge-new">NEW</span>}
                    <strong className="mynoti-title">
                      {noti.notificationType === "ADMIN_NOTICE" && <span style={{color: '#e74c3c', marginRight: '6px'}}>[관리자]</span>}
                      {noti.title}
                    </strong>
                    <span className="mynoti-date">{formatDateTime(noti.createTime)}</span>
                  </div>
                  <p className="mynoti-desc">{noti.message}</p>
                </div>
                <button className="mynoti-delete-btn" onClick={(e) => handleDelete(e, noti.id)} title="영구 삭제">&times;</button>
              </div>
            ))}
          </div>
        )}

        <div className="mynoti-pagination">
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        <NotificationDetail isOpen={!!selectedNoti} onClose={() => setSelectedNoti(null)} noti={selectedNoti} />
      </div>
    </div>
  );
};

export default MyNotification;