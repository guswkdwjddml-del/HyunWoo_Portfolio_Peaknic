import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../../css/board/review/reviewWrite.css";
import FileUpload from "../common/FileUpload";
import "../../../css/board/boardLayout.css";

const ReviewUpdate = () => {
  const navigate = useNavigate();

  const { id } = useParams();


  // 기존 파일
  const [oldFileNames, setOldFileNames] = useState([]);

  // 삭제할 기존 파일
  const [deletedFileNames, setDeletedFileNames] = useState([]);

  // 리뷰 데이터
  const [review, setReview] = useState({
    title: "",
    content: "",
    category: "REVIEW",
    mountainId: "",
    oldFileNames: [],
    newFileNames: [],
  });

  // 파일
  const [files, setFiles] = useState([]);

  // 미리보기
  const [previewUrls, setPreviewUrls] = useState([]);

  // 크루
  const [crewName, setCrewName] = useState("");

  // 산
  const [mountainName, setMountainName] = useState("");

  // 기존 리뷰 조회
  useEffect(() => {
    const getReview = async () => {
      try {
        const res = await axios.get(`/api/review/${id}`);

        console.log("기존 리뷰 데이터 : ", res.data);

        setReview({
          title: res.data.title,
          content: res.data.content,
          category: "REVIEW",
          mountainId: res.data.mountainId,
          oldFileNames: res.data.oldFileNames || [],
          newFileNames: res.data.newFileNames || [],
        });

        setMountainName(res.data.mountainName);

        setCrewName(res.data.crewName);

        // 기존 파일 저장
        setOldFileNames(res.data.oldFileNames || []);
      } catch (error) {
        console.log("리뷰 조회 오류 : ", error);
      }
    };

    getReview();
  }, [id]);

  // 입력 변경
  const changeFn = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    setReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 리뷰 수정
  const updateFn = async () => {
    if (!review.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!review.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    const formData = new FormData();

    formData.append("title", review.title);

    formData.append("content", review.content);

    formData.append("category", "REVIEW");

    formData.append("mountainId", review.mountainId);

    // 신규 파일 추가
    files.forEach((file) => {
      formData.append("boardFiles", file);
    });

    // 삭제 파일 추가
    deletedFileNames.forEach((fileName) => {
      formData.append("deletedFileNames", fileName);
    });

    try {
      await axios.put(`/api/review/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("리뷰 수정 완료");

      navigate(`/review/detail/${id}`);
    } catch (error) {
      console.log("리뷰 수정 오류 : ", error);
    }
  };

  return (
    <div className="reviewWrite">
      <div className="reviewWrite-con">
        <h2>리뷰 수정</h2>

        {/* 제목 */}

        <div className="inputBox">
          <label>제목</label>

          <input
            type="text"
            name="title"
            value={review.title}
            onChange={changeFn}
          />
        </div>

        {/* 리뷰 대상 정보 */}

        <div className="reviewBox">
          <h3>리뷰 대상 정보</h3>

          <p>
            <strong>크루명 :</strong>

            {crewName}
          </p>

          <p>
            <strong>산 :</strong>

            {mountainName}
          </p>
        </div>

        {/* 내용 */}

        <div className="inputBox">
          <label>내용</label>

          <textarea
            name="content"
            value={review.content}
            onChange={changeFn}
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 파일 */}

        <FileUpload
          files={files}
          setFiles={setFiles}
          previewUrls={previewUrls}
          setPreviewUrls={setPreviewUrls}
          oldFileNames={review.oldFileNames}
          newFileNames={review.newFileNames}
          setOldFileNames={(value) =>
            setReview((prev) => ({
              ...prev,
              oldFileNames:
                typeof value === "function" ? value(prev.oldFileNames) : value,
            }))
          }
          setNewFileNames={(value) =>
            setReview((prev) => ({
              ...prev,
              newFileNames:
                typeof value === "function" ? value(prev.newFileNames) : value,
            }))
          }
          deletedFileNames={deletedFileNames}
          setDeletedFileNames={setDeletedFileNames}
        />
        {/* 버튼 */}

        <div className="btnArea">
          <button className="saveBtn" onClick={updateFn}>
            수정
          </button>

          <button
            className="cancelBtn"
            type="button"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewUpdate;
