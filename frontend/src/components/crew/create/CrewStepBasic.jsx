import React from "react";

const AVAILABLE_TAGS = ["당일산행", "야간산행", "주말산행", "2030","4050","나이무관"];


// 이름,사진,태그 1단계(step) 기본정보 담당
const CrewStepBasic = ({ crewData, handleInput, imageFiles, setImageFiles, imagePreviews, setImagePreviews, tags, setTags }) => {

  // 파일 선택 시 이미지와 썸네일을 미리보기 배열에 추가하는 함수
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) return alert("이미지는 최대 5장까지 첨부 가능합니다.");
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  // 등록한 이미지를 삭제하는 함수
  const removeImage = (index) => {
    // 1. 화면에 보이는 미리보기(Preview) 배열에서 선택한 사진을 화면에서 즉시 삭제
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // 2. 수정(Update) 화면, 지우려는 사진이 기존 서버(Docker)에 있던 사진이라면?
    if (existingImages && index < existingImages.length) {
      // 백엔드에 전송할 '유지할 이미지 ID 목록'에서 이 사진을 빼버려 삭제되도록 유도
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else { 
      // 만약 생성(Create) 화면, 수정 화면에서 업로드이미지를 다시 지우면, 로컬파일 배열에서만 파일 삭제
      const fileIndex = existingImages ? index - existingImages.length : index;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  // 5개 이하로 태그를 토글하여 저장하는 함수
  const toggleTag = (tag) => {
    if (tags.includes(tag)) setTags(tags.filter((t) => t !== tag));
    else {
      if (tags.length >= 5) return alert("태그는 최대 5개까지 선택 가능합니다.");
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="cc-step-content fade-in">
      <h2>모임의 기본 정보를 입력해주세요</h2>
      <div className="input-group">
        <label>모임 이름</label>
        <input type="text" name="crewName" value={crewData.crewName} onChange={handleInput} placeholder="예: 북한산 백운대 일출 산행" />
      </div>

      <div className="input-group">
        <label>모임 사진 첨부 (최대 5장)</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        <small className="info-text">💡 첨부된 첫 번째 사진이 썸네일(대표 이미지)로 사용됩니다.</small>
        {imagePreviews.length > 0 && (
          <div className="image-preview-container">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className={`preview-box ${idx === 0 ? "thumbnail-main" : ""}`}>
                {idx === 0 && <span className="thumb-badge">대표</span>}
                <img src={src} alt="미리보기" />
                <button onClick={() => removeImage(idx)} className="btn-remove-img">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="input-group">
        <label>상세 소개</label>
        <textarea name="crewDetail" value={crewData.crewDetail} onChange={handleInput} placeholder="모임에 대해 자세히 소개해주세요." rows="5"></textarea>
      </div>

      {/* <div className="input-group">
        <label>오픈채팅방 주소 (선택)</label>
        <input type="text" name="chatLink" value={crewData.chatLink} onChange={handleInput} placeholder="예: https://open.kakao.com/o/..." />
        <small className="info-text" style={{ color: '#888' }}>참여자들과 소통할 수 있는 채팅방 링크를 적어주세요.</small>
      </div> */}

      <div className="input-group">
        <label>태그 선택 (최대 5개)</label>
        <div className="tag-toggle-group">
          {AVAILABLE_TAGS.map((tag) => (
            <button key={tag} type="button" className={`tag-toggle-btn ${tags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrewStepBasic;