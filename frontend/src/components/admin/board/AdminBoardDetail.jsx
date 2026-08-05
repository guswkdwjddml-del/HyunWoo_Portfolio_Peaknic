import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const AdminBoardDetail = () => {
  const { category, id } = useParams();
  const [subCategory, setSubCategory] = useState("");
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedFileNames, setDeletedFileNames] = useState([]);

  const fileInputRef = useRef();

  // 수정 가능한 게시판
  const editableCategories = ["notice", "faq"];
  const isReadOnly = !editableCategories.includes(category);

  //최대 5개까지만 파일첨부 가능하도록 파일갯수 계산
  const currentFileCount = board
    ? (board.newFileNames?.length || 0) + files.length
    : 0;
  const remainCount = 5 - currentFileCount;

  const boardDetailFn = async () => {
    try {
      const res = await axios.get(`/api/board/${id}`);
      let data = res.data;

      // FAQ의 경우 제목에서 질문분류태그[] 분리
      if (category === "faq") {
        const match = data.title.match(/^\[(.*?)\]\s*(.*)$/);

        if (match) {
          setSubCategory(match[1]);

          data = {
            ...data,
            title: match[2]
          };
        }
      }

      setBoard(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { boardDetailFn() }, [id]);

  // 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoard((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //기존 이미지 삭제 함수
  const removeExistingImage = (fileName) => {

    setDeletedFileNames(prev =>
      prev.includes(fileName)
        ? prev
        : [...prev, fileName]
    );

    setBoard(prev => ({
      ...prev,
      newFileNames:
        prev.newFileNames?.filter(
          name => name !== fileName
        ) || []
    }));

  };

  //파일 (다건) 함수
  const fileChangeFn = (e) => {

    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > remainCount) {
      alert(
        `이미지는 최대 5장까지 가능합니다. 현재 ${remainCount}장 추가 가능합니다.`
      );
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

    fileInputRef.current.value = ""; //브라우저 input 값도 삭제시 초기화 
  }


  const updateFn = async () => {
    if (!window.confirm("수정하시겠습니까?")) {
      return;
    }

    try {

      const formData = new FormData();

      // FAQ인 경우 제목에 질문분류태그 추가해서 보냄
      let saveTitle = board.title;
      if (category === "faq" && subCategory) {
        saveTitle = `[${subCategory}] ${board.title}`;
      }
      formData.append("title", saveTitle);

      formData.append("content", board.content);

      files.forEach(file => {
        formData.append("boardFiles", file);
      });

      deletedFileNames.forEach(name => {
        formData.append("deletedFileNames", name);
      });

      await axios.put(
        `/api/board/${board.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("수정되었습니다");
      navigate(`/admin/board/${category}`);
    } catch (err) {
      console.log(err);
    }
  }

  const deleteFn = async () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(`/api/board/${board.id}`);
      alert("삭제되었습니다");
      navigate(`/admin/board/${category}`);
    } catch (err) {
      console.log(err);
    }
  }

  if (!board) {
    return <div>Loading...</div>;
  }

  return (
    <div className="boardDetail">
      <div className="boardDetail-con">

        {/* FAQ일 경우에만 질문분류 태그 추가 */}
        <div className="title-row">
          {
            category === "faq" &&
            <div className="board-field">
              <label>질문분류</label>

              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="detailInfo">
          <div>
            <span>작성자</span>
            <strong>{board.userName}</strong>
          </div>
          <div>
            <span>조회수</span>
            <strong>{board.viewCount}</strong>
          </div>
        </div>
        <div className="inputBox">
          <label>내용</label>
          <textarea
            name="content"
            value={board.content}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>

        <div className="previewSection">
          <h4>첨부 이미지</h4>
          <div className="previewList">
            {board.newFileNames?.map((fileName, index) => (
              <div className="previewItem" key={index}>
                {/* 기존이미지 삭제버튼 */}
                {!isReadOnly && (
                  <button
                    type="button"
                    className="removeBtn"
                    onClick={() => removeExistingImage(fileName)}
                  >
                    ✕
                  </button>
                )}
                {/* 기존이미지 나열 */}
                <img
                  src={`${encodeURIComponent(fileName)}`}
                  alt=""
                />
              </div>
            ))}
          </div>
          {/* 이미지 추가 */}
          {!isReadOnly && (
            <div className="inputBox">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={fileChangeFn}
                disabled={isReadOnly || currentFileCount >= 5}
              />
              <p className="fileGuide">
                현재 {currentFileCount}/5장 첨부됨
              </p>
            </div>
          )}

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
                이미지를 추가합니다
              </h4>
              <div className="previewList">
                {previewUrls.map((url, index) => (
                  <div
                    className="previewItem"
                    key={index}
                  >
                    {!isReadOnly && (
                      <button
                        type="button"
                        className="removeBtn"
                        onClick={() => removeImage(index)}
                      >
                        ✕
                      </button>
                    )}
                    <img src={url} alt="" />
                  </div>
                ))}
              </div>
            </div>
          )
          }
        </div>

        <div className="boardDetail-btn">
          {!isReadOnly && (
            <button onClick={updateFn}>
              수정
            </button>
          )}
          <button onClick={deleteFn}>
            삭제
          </button>
          <button onClick={() => navigate(`/admin/board/${category}`)}>
            목록
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminBoardDetail