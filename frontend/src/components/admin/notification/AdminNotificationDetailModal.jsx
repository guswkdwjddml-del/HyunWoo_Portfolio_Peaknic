import React from "react";
import { formatDateTime } from "../../../utils/commonModule";
import "../../../css/notification/AdminNotificationDetailModal.css";


const AdminNotificationDetailModal = ({ isOpen, onClose, noti }) => {
  if (!isOpen || !noti) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="admin-modal-close-btn" onClick={onClose}>&times;</button>

        <h3 className="admin-modal-title">알림 상세 정보</h3>

        {/* 기본 내용 영역 */}
        <div className="admin-modal-section">
          <h4 style={{ color: '#0f172a', fontSize: '16px', marginBottom: '8px' }}>{noti.title}</h4>
          <div className="admin-modal-content-text">{noti.message}</div>
          
          {noti.imageUrl && noti.imageUrl.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              {noti.imageUrl.map((img, idx) => (
                <img key={idx} src={`${img}`} alt="첨부이미지" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          )}

          {noti.relatedUrl && (
            <div style={{ fontSize: '13px', color: '#2563eb', marginTop: '10px' }}>
              관련 링크: <a href={noti.relatedUrl} target="_blank" rel="noreferrer">{noti.relatedUrl}</a>
            </div>
          )}
        </div>

        {/* 발송 정보 영역 */}
        <div className="admin-modal-section" style={{ borderBottom: 'none', marginBottom: 0 }}>
          <h4>발송 정보</h4>
          <div className="admin-modal-grid">
            <div>발송자: <strong>{noti.adminId || '시스템'}</strong></div>
            <div>발송일: <strong>{formatDateTime(noti.createTime)}</strong></div>
            <div>발송 대상: <strong>{noti.role || '전체 회원'}</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminNotificationDetailModal;