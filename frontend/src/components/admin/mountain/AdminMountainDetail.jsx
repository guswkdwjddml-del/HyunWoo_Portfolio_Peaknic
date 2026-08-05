import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const AdminMountainDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mountain, setMountain] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [deleteFile, setDeleteFile] = useState(false);

  const fileInputRef = useRef();

  const mountainDetailFn = async () => {
    try {
      const res = await axios.get(`/api/mountains/${id}`);
      setMountain(res.data);
      console.log("상세정보: " + res.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => { mountainDetailFn() }, [id]);

  // 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMountain((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //기존 이미지 삭제 함수
  const removeExistingImage = () => {
    setDeleteFile(true);

    setMountain(prev => ({
      ...prev,
      newFileName: null
    }));

  };

  //파일 선택 함수
  const fileChangeFn = (e) => {

    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // 이전 미리보기 URL 제거
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setDeleteFile(false);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };


  //업로드 전 이미지 삭제 기능  
  //preview 삭제하면 -> 업로드 파일 목록 이름도 삭제
  const removeImage = () => {

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl("");
    setDeleteFile(false);  //오류방지용

    fileInputRef.current.value = "";   //브라우저 input 값도 삭제시 초기화 
  }

  const updateFn = async () => {

    // URL + 새 파일 동시 선택 방지
    if (mountain.imageUrl && file) {
      alert("이미지 URL과 파일 첨부 중 하나만 선택해주세요.");
      return;
    }

    if (!window.confirm("수정하시겠습니까?")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", mountain.id);
      formData.append("description", mountain.description || "( - )");
      formData.append("imageUrl", mountain.imageUrl || "");
      formData.append("deleteFile", String(deleteFile));

      if (file) {
        formData.append("mountainFile", file);
      }

      await axios.put(`/admin/mountain/${mountain.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("수정되었습니다");
      navigate(`/admin/mountain`);
    } catch (err) {
      console.log(err);
    }
  }

  if (!mountain) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mountainDetail">
      <div className="mountainDetail-con">
        <div className="detailInfo">
          <div>
            <span>ID</span>
            <strong>{mountain.id}</strong>
          </div>
          <div>
            <span>산코드</span>
            <strong>{mountain.mountainCode}</strong>
          </div>
          <div>
            <span>산이름</span>
            <strong>{mountain.mountainName}</strong>
          </div>
          <div>
            <span>소재지</span>
            <strong>{mountain.sido} {mountain.sigungu}</strong>
          </div>
          <div>
            <span>높이(m)</span>
            <strong>{mountain.height}</strong>
          </div>
        </div>
        <div className="inputBox">
          <label>산소개</label>
          <div className="descriptionInputBox">
            <textarea
              name="description"
              value={mountain.description || ""}
              onChange={handleChange}
            />
            {mountain.description && (
              <button
                type="button"
                className="descriptionRemoveBtn"
                onClick={() =>
                  setMountain(prev => ({
                    ...prev,
                    description: "",
                  }))
                }
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="imageInputBox">
          <label>산 이미지
            <small>(URL이 없는 경우 파일첨부 가능)</small>
            </label>
          <div className="imageUrl">
            <h4>URL</h4>
            <div className="urlInputBox">
              <input
                type="text"
                name="imageUrl"
                value={mountain.imageUrl || ""}
                onChange={handleChange}
              />
              {mountain.imageUrl && (
                <button
                  type="button"
                  className="urlRemoveBtn"
                  onClick={() =>
                    setMountain(prev => ({
                      ...prev,
                      imageUrl: "",
                    }))
                  }
                >
                  ✕
                </button>
              )}
            </div>
            {mountain.imageUrl && (
              <div className="urlPreview">
                <img
                  src={mountain.imageUrl}
                  alt="URL 미리보기"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          <div className="previewSection">
            <h4>파일첨부</h4>
            {mountain.newFileName && (
              <div className="previewItem">
                {/* 기존이미지 삭제버튼 */}
                <button
                  type="button"
                  className="removeBtn"
                  onClick={removeExistingImage}
                >
                  ✕
                </button>
                {/* 기존이미지 */}
                <img
                  src={`${encodeURIComponent(mountain.newFileName)}`}
                  alt=""
                />
              </div>
            )}
            {/* 이미지 추가 */}
            <div className="inputBox">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={fileChangeFn}
              />
            </div>

            {/* 파일명 */}
            {file && (
              <div className="fileBox">
                <h4>선택한 파일</h4>
                <div className="fileItem">
                  📄 {file.name}
                </div>
              </div>
            )}

            {/* 이미지 미리보기 */}
            {previewUrl && (
              <div className="previewBox">
                <h4>
                  이미지를 추가합니다
                </h4>
                <div className="previewItem">
                  <button
                    type="button"
                    className="removeBtn"
                    onClick={removeImage}
                  >
                    ✕
                  </button>
                  <img src={previewUrl} alt="" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mountainDetail-btn">
          <button onClick={updateFn}>
            수정
          </button>
          <button onClick={() => navigate(`/admin/mountain`)}>
            목록
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminMountainDetail
