import React, { useState, useRef } from 'react';
import axios from 'axios';


// 폼 데이터를 입력받아 백엔드에 다중 파일과 함께 리뷰를 저장합니다.
const MountainReviewWrite = ({ mountainId = 1 }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); 
  const fileInputRef = useRef(null);

  // 다중 파일 선택 시 배열 상태를 업데이트합니다.
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 폼 제출 시 FormData를 구성하여 백엔드 저장 API를 호출합니다.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', 'REVIEW'); 
    formData.append('mountainId', mountainId);  

    files.forEach((file) => {
      formData.append('boardFiles', file); 
    });

    try {
      const response = await axios.post(`/api/board/save`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        }
      });
      
      alert(`🎉 리뷰와 ${files.length}장의 사진이 성공적으로 등록되었습니다!`);
      setTitle('');
      setContent('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className="mountain-review-write">
      <h3 className="write-title">테스트용 후기(REVIEW) 작성 📝</h3>
      <p className="write-subtitle">연결된 산 ID: {mountainId}</p>

      <form onSubmit={handleSubmit} className="write-form">
        <div className="form-group">
          <label className="form-label">리뷰 제목</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="산행 후기 제목을 적어주세요."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">리뷰 내용</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="재밌게 다녀오셨나요? 후기를 자유롭게 남겨주세요."
            className="form-textarea"
          />
        </div>

        <div className="form-group file-upload-group">
          <label className="form-label">📸 다중 사진 업로드</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
            ref={fileInputRef}
            className="form-file-input"
          />
          {files.length > 0 && (
            <p className="file-success-msg">✅ {files.length}장의 사진이 선택되었습니다.</p>
          )}
        </div>

        <button type="submit" className="btn-submit-review">
          테스트 리뷰 등록하기
        </button>
      </form>
    </div>
  );
};

export default MountainReviewWrite;