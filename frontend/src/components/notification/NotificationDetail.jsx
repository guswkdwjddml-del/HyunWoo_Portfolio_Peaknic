import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../utils/commonModule';
import '../../css/notification/notificationDetail.css';


const NotificationDetail = ({ isOpen, onClose, noti }) => {
  const navigate = useNavigate();

  if (!isOpen || !noti) return null;

  // 발송 주체 판별 (adminId가 있으면 관리자 발송)
  const isAdminNoti = noti.adminId > 0;

  // 바로가기 클릭 시 페이지 이동 및 모달 닫기
  // 외부/내부 링크 분기 처리
  const handleLinkClick = () => {
    if (noti.relatedUrl) {
      if (noti.relatedUrl.startsWith('http://') || noti.relatedUrl.startsWith('https://')) {
        window.open(noti.relatedUrl, '_blank'); // 외부 링크는 새 창으로
      } else {
        navigate(noti.relatedUrl); // 내부 링크는 리액트 라우터로 이동
      }
      onClose();
    }
  };

  return (
    <div className="noti-modal-overlay" onClick={onClose}>
      <div className="noti-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="noti-modal-header">
          <div className="header-title-area">
            {isAdminNoti && <span className="badge-admin">[관리자 발송]</span>}
            <span className="badge-type">[{noti.notificationType}]</span>
            <h3>{noti.title}</h3>
          </div>
          <button className="noti-modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {/* 모달 메타 정보 (날짜 등) */}
        <div className="noti-modal-meta">
          <span className="date">{formatDateTime(noti.createTime)}</span>
        </div>

        {/* 모달 본문 */}
        <div className="noti-modal-body">
          <p className="message">{noti.message}</p>
          
          {/* 이미지가 있을 경우 렌더링 */}
          {noti.imageUrl && noti.imageUrl.length > 0 && (
            <div className="image-wrapper">
              {noti.imageUrl.map((img, idx) => (
                <img key={idx} src={`${img}`} alt="알림 첨부이미지" />
              ))}
            </div>
          )}
        </div>

        {/* 모달 푸터 (바로가기 & 확인) */}
        <div className="noti-modal-footer">
          {noti.relatedUrl && (
            <button className="btn-link" onClick={handleLinkClick}>바로가기 ➔</button>
          )}
          <button className="btn-close" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;