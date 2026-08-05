import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../../css/notification/notificationDropdown.css";
import { useStomp } from "../../js/useStomp";
import {
  setInitNoticeData,
  addRealtimeNotice,
  readNoticeGlobal,
  readAllNoticesGlobal,
} from "../../store/slice/notificationSlice";
import NotificationDetail from "./NotificationDetail";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux 전역 상태 연결
  const { unreadCount, headerNotis } = useSelector(
    (state) => state.notification,
  );
  const { realtimeNotice } = useStomp();

  const [selectedNoti, setSelectedNoti] = useState(null); // 모달창에 띄울 알림 데이터

  // 최초 로드 시 안 읽은 데이터 조회
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const getInitData = async () => {
      try {
        const [listRes, countRes] = await Promise.all([
          axios.get(`/api/notification`, {params: { isRead: false }, }),
          axios.get(`/api/notification/count`),
        ]);
        dispatch(
          setInitNoticeData({
            notis: listRes.data.content,
            count: countRes.data,
          }),
        );
      } catch (error) {
        console.error("알림 조회 실패", error);
      }
    };
    getInitData();
  }, [dispatch]);

  // 실시간 알림 수신
  useEffect(() => {
    if (realtimeNotice) {
      dispatch(addRealtimeNotice(realtimeNotice));
    }
  }, [realtimeNotice, dispatch]);

  // 외부 클릭 닫기
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // 개별 알림 클릭 로직 (읽음 처리 + 관리자 알림 분기)
  const handleItemClick = async (noti, e = null) => {
    if (e) e.stopPropagation();
    
    // 안 읽은 알림이면 서버와 Redux 상태 모두 읽음 처리
    if (!noti.isRead) {
      try {
        await axios.patch(`/api/notification/${noti.id}/read`);
        dispatch(readNoticeGlobal(noti.id));
      } catch (error) {
        console.error("읽음 처리 실패", error);
      }
    }

    // 관리자 발송 알림이면 모달창 띄우기
    if (noti.notificationType === 'ADMIN_NOTICE' || noti.adminId > 0) {
      setSelectedNoti(noti);
    } 
    // 시스템 알림이면 즉시 링크 이동
    else if (noti.relatedUrl) {
      if (noti.relatedUrl.startsWith('http://') || noti.relatedUrl.startsWith('https://')) {
        window.open(noti.relatedUrl, '_blank');
      } else {
        navigate(noti.relatedUrl);
      }
      setIsOpen(false);
    }
  };

  // 모두 읽음
  const handleReadAll = async () => {
    try {
      await axios.patch(`/api/notification/read-all`);
      dispatch(readAllNoticesGlobal());
    } catch (error) {
      console.error("전체 읽음 실패", error);
    }
  };

  return (
    <div className="notification-wrapper" ref={notificationRef}>
      <button className="notification-btn" onClick={() => setIsOpen(!isOpen)}>
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <div className="notification-top">
            <span>최근 알림</span>
            {headerNotis.length > 0 && (<button className="notification-read-all" onClick={handleReadAll}>모두 읽음</button>)}
          </div>

          {headerNotis.length === 0 ? <p className="notification-empty">새로운 알림이 없습니다.</p> : (
            headerNotis.map(item => (
              <div className="notification-item unread" key={item.id} onClick={() => handleItemClick(item)}>
                <div className="notification-header">
                  {/* 관리자 알림일 경우 뱃지 렌더링 */}
                  <div className="title-area">
                    {!item.isRead && <span className="notification-dot"></span>}
                    {item.adminId > 0 && <span className="badge-admin">[관리자]</span>}
                    <strong className="notification-title">{item.title}</strong>
                  </div>
                  {/* 드롭다운에서 알림을 바로 닫는(삭제하는) 버튼 대신, 읽음 처리만 하도록 onClick 조정 */}
                  <button className="notification-close" onClick={(e) => handleItemClick(item, e)}>✕</button>
                </div>
                <p className="notification-message">{item.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 공통 알림 상세 모달 연결 */}
      <NotificationDetail 
        isOpen={!!selectedNoti} 
        onClose={() => setSelectedNoti(null)} 
        noti={selectedNoti} 
      />
    </div>
  );
};

export default NotificationDropdown;
