import React, { useState } from "react";
import { useRef } from "react"; //파일 삭제 시 초기화
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AdminBoardWrite = () => {

  const { category } = useParams();
  const [subCategory, setSubCategory] = useState("모임");
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const categoryTitle = {
    notice: "공지사항",
    faq: "FAQ",
  };

  const [board, setBoard] = useState({
    title: "",
    content: "",
  })

  //파일 다건
  const [files, setFiles] = useState([]);
  // 이미지 미리보기
  const [previewUrls, setPreviewUrls] = useState([]);

  // 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //파일 (다건) 함수
  const fileChangeFn = (e) => {

    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 5) {
      alert("최대 5장까지 가능합니다.");
      return;
    }

    setFiles(prev => [...prev, ...selectedFiles]);

    const urls = selectedFiles.map(file =>
      URL.createObjectURL(file)
    );

    setPreviewUrls(prev => [...prev, ...urls]);
  };

  //업로드 전 이미지 삭제 기능  
  //preview 삭제하면 -> 업로드 파일 목록 이름도 삭제
  const removeImage = (index) => {

    setFiles(prev =>
      prev.filter((_, i) => i !== index)
    );

    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });

    fileInputRef.current.value = ""; //브라우저 inmput 값도 삭제시 초기화 
  }

  const saveFn = async () => {
    try {
      const formData = new FormData();

      // FAQ일 경우 제목 앞에 분류 태그 추가
      let saveTitle = board.title;
      if (category === "faq" && subCategory) {
        saveTitle = `[${subCategory}] ${board.title}`;
      }

      formData.append("title", saveTitle);
      formData.append("content", board.content);

      files.forEach(file => {
        formData.append("boardFiles", file);
      });

      // 카테고리 있으면 전달
      if (category) {
        formData.append(
          "category",
          category.toUpperCase()
        );
      }

      await axios.post(`/api/board/save`, formData);
      alert("게시글이 등록되었습니다.");
      navigate(`/admin/board/${category}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="boardWrite">
      <div className="boardWrite-con">
        <h2>
          {categoryTitle[category]
            ? categoryTitle[category] + " 등록"
            : "게시글 등록"}
        </h2>

        {/* FAQ 질문분류 + 제목 */}
        <div className="title-row">
          {
            category === "faq" &&
            <div className="board-field">
              <label>질문분류</label>

              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option value="회원">회원</option>
                <option value="결제">결제</option>
                <option value="크루">크루</option>
                <option value="기타">기타</option>
              </select>
            </div>
          }

          <div className="inputBox titleBox">
            <label>제목</label>
            <input
              type="text"
              name="title"
              value={board.title}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
            />
          </div>
        </div>

        {/* 내용 */}
        <div className="inputBox">
          <label>내용</label>
          <textarea
            name="content"
            value={board.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 첨부파일 */}
        <div className="inputBox">
          <label>첨부파일</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={fileChangeFn}
          />
          <p className="fileGuide">
            이미지는 최대 5장까지 업로드 가능합니다.
          </p>
        </div>

        {/* 파일명 */}
        {files.length > 0 && (
          <div className="fileBox">
            <h4>선택한 파일 ({files.length}/5)</h4>
            <div className="fileList">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="fileItem"
                >
                  📄 {file.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 이미지 미리보기 */}
        {previewUrls.length > 0 && (
          <div className="previewBox">
            <h4>
              첨부 이미지
            </h4>
            <div className="previewList">
              {previewUrls.map((url, index) => (
                <div
                  className="previewItem"
                  key={index}
                >
                  <button
                    type="button"
                    className="removeBtn"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                  <img src={url} alt="" />
                </div>
              ))}
            </div>
          </div>
        )
        }
        <div className="admin-btn">
          <button onClick={saveFn}>등록</button>
          <button type="button" onClick={() => navigate(`/admin/board/${category}`)}>취소</button>
        </div>
      </div>
    </div>
  )
}

export default AdminBoardWrite
