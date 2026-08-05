import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../css/notification/AdminNotificationWrite.css';


const AdminNotificationWrite = () => {
  const navigate = useNavigate();

  // 1단: 발송 대상 상태
  const [targetType, setTargetType] = useState('ALL'); // ALL, ROLE, MEMBER
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  
  // 특정 회원 검색 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]); // [{ id, userName, userEmail }]

  // 2단 & 3단: 알림 내용 상태
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    relatedUrl: ''
  });
  const [files, setFiles] = useState([]);

  // 회원 통합 검색 API 호출 (ID, 이름, 이메일)
  const handleSearchMember = async () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    try {
      const res = await axios.get(`/api/admin/notification/members/search?keyword=${searchKeyword}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSearchResults(res.data);
      if (res.data.length === 0) alert("검색된 수신 동의 회원이 없습니다.");
    } catch (err) {
      console.error(err);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  // 검색된 회원 추가
  const handleAddMember = (member) => {
    if (!selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // 선택된 회원 제거
  const handleRemoveMember = (idToRemove) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== idToRemove));
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    if (targetType === 'MEMBER' && selectedMembers.length === 0) {
      alert("발송할 특정 회원을 1명 이상 추가해주세요.");
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("message", formData.message);
    payload.append("targetType", targetType); // 필수! 안전한 분기 처리를 위해 전송
    
    if (formData.relatedUrl) {
      payload.append("relatedUrl", formData.relatedUrl);
    }

    // 타겟팅 데이터 전송
    if (targetType === 'ROLE') {
      payload.append("role", selectedRole);
    } else if (targetType === 'MEMBER') {
      selectedMembers.forEach(m => payload.append("memberIds", m.id));
    }

    // 파일이 있는 경우에만 안전하게 append (500 에러 원천 차단)
    if (files.length > 0) {
        files.forEach(file => payload.append("files", file));
    }

    try {
      await axios.post(`/api/admin/notification/send`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      alert("알림이 성공적으로 발송되었습니다!");
      navigate('/admin/notification'); // 목록으로 이동
    } catch (error) {
      console.error("알림 발송 실패:", error);
      alert("알림 발송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="admin-noti-write-container">
      <h2>관리자 알림 발송</h2>

      {/* 1단: 발송 대상 */}
      <div className="write-section">
        <h3>1. 발송 대상 선택</h3>
        <div className="target-radio-group">
          <label><input type="radio" checked={targetType === 'ALL'} onChange={() => setTargetType('ALL')}/> 전체 회원</label>
          <label><input type="radio" checked={targetType === 'ROLE'} onChange={() => setTargetType('ROLE')}/> 권한별 발송</label>
          <label><input type="radio" checked={targetType === 'MEMBER'} onChange={() => setTargetType('MEMBER')}/> 특정 회원 검색</label>
        </div>
        
        {/* 권한 선택 UI (Role 기반 4단계) */}
        {targetType === 'ROLE' && (
          <div className="target-detail-box fade-in">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="JUNIOR">JUNIOR (새싹회원)</option>
              <option value="MEMBER">MEMBER (일반회원)</option>
              <option value="HOST">HOST (크루장)</option>
              <option value="ADMIN">ADMIN (관리자)</option>
            </select>
          </div>
        )}

        {/* 특정 회원 검색 UI */}
        {targetType === 'MEMBER' && (
          <div className="target-detail-box fade-in">
            <div className="member-add-row">
              <input 
                type="text" 
                placeholder="ID, 이름, 이메일(ex: admin) 검색" 
                value={searchKeyword} 
                onChange={(e) => setSearchKeyword(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSearchMember()}
              />
              <button type="button" className="btn-add" onClick={handleSearchMember}>검색</button>
            </div>

            {/* 검색 결과 목록 */}
            {searchResults.length > 0 && (
                <div className="search-result-box">
                    <ul className="search-result-list">
                        {searchResults.map(member => (
                            <li key={member.id} className='search-result-list-key'>
                                <div>
                                    <span className="role-badge" >{member.role}</span>
                                    <span><strong>{member.userName}</strong> ({member.userEmail}) - ID: {member.id}</span>
                                </div>
                                <button type="button" onClick={() => handleAddMember(member)}>+ 추가</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="selected-members-wrap">
              {selectedMembers.map(m => (
                <span key={m.id} className="member-tag">
                  {m.userName} ({m.id}) <button onClick={() => handleRemoveMember(m.id)}>✕</button>
                </span>
              ))}
              {selectedMembers.length === 0 && <span className="empty-tag">추가된 회원이 없습니다.</span>}
            </div>
          </div>
        )}
      </div>

      {/* 2단: 상세 내용 */}
      <div className="write-section">
        <h3>2. 상세 내용 작성</h3>
        <div className="input-group">
          <label>알림 제목</label>
          <input type="text" placeholder="예: 여름철 산행 주의사항 안내" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
        </div>
        
        <div className="input-group">
          <label>알림 내용</label>
          <textarea placeholder="전달할 메시지를 입력해주세요." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
        </div>

        <div className="input-group">
          <label>관련 링크 (선택)</label>
          <input type="text" placeholder="예: /board/notice/1" value={formData.relatedUrl} onChange={(e) => setFormData({...formData, relatedUrl: e.target.value})} />
        </div>

        <div className="input-group">
          <label>이미지 첨부 (선택)</label>
          <input type="file" multiple accept="image/*" className="file-input" onChange={(e) => setFiles(Array.from(e.target.files))} />
        </div>
      </div>

      {/* 3단: 제출 */}
      <div className="submit-area">
        <button onClick={() => navigate(-1)} className="btn-cancel">취소</button>
        <button onClick={handleSubmit} className="btn-submit">알림 발송</button>
      </div>
    </div>
  );
};

export default AdminNotificationWrite;