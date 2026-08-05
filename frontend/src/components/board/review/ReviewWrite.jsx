import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../css/board/review/reviewWrite.css";
import FileUpload from "../common/FileUpload"; // 파일 공통 사용
import "../../../css/board/boardLayout.css";

const ReviewWrite = () => {
  const navigate = useNavigate();


  // 로그인 회원 정보
  const [member, setMember] = useState(null);

  // 리뷰 데이터
  const [review, setReview] = useState({
    title: "",
    content: "",
    category: "REVIEW",
    mountainId: "",
    paymentItemId: "",
  });

  // 리뷰 작성 가능한 산 목록
  const [mountainList, setMountainList] = useState([]);

  // 파일
  const [files, setFiles] = useState([]);

  // 미리보기
  const [previewUrls, setPreviewUrls] = useState([]);

  // 로그인 회원 정보 조회
  useEffect(() => {
    const getMemberInfo = async () => {
      try {
        const res = await axios.get(`/api/review/info`);

        console.log("로그인 회원 정보 : ", res.data);

        setMember(res.data);
      } catch (error) {
        console.log("회원 정보 조회 오류 : ", error);
      }
    };

    getMemberInfo();
  }, []);

  // 리뷰 작성 가능한 산 목록 조회
  useEffect(() => {
    const getMountainList = async () => {
      try {
        const res = await axios.get(`/api/review/write/mountains`);

        console.log("리뷰 작성 가능한 목록 : ", res.data);

        setMountainList(res.data);
      } catch (error) {
        console.log("리뷰 작성 산 목록 조회 오류 : ", error);
      }
    };

    getMountainList();
  }, []);

  // 입력 변경
  const changeFn = (e) => {
    const name = e.target.name;

    const value = e.target.value;

    setReview((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // 산 선택
  const mountainChangeFn = (e) => {
    const mountainId = Number(e.target.value);

    // 선택한 산 정보 찾기
    // reviewWriteMountainList()에서 가져온 DTO 기준
    const selectMountain = mountainList.find(
      (item) => item.mountainId === mountainId,
    );

    // 선택값이 없으면 종료
    if (!selectMountain) {
      return;
    }

    // 리뷰 저장용 데이터 세팅
    // mountainId -> BoardEntity 저장용
    // paymentItemId -> 리뷰 작성 완료 처리용
    setReview((prev) => ({
      ...prev,

      mountainId: selectMountain.mountainId,

      paymentItemId: selectMountain.paymentItemId,
    }));
  };

  // 리뷰 등록
  const saveFn = async () => {
    if (!review.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!review.content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!review.mountainId) {
      alert("리뷰 작성 할 산을 선택해주세요.");

      return;
    }
    if (!review.paymentItemId) {
      alert("결제 정보를 찾을 수 없습니다.");

      return;
    }

    const formData = new FormData();

    formData.append("title", review.title);

    formData.append("content", review.content);

    formData.append("category", review.category);

    formData.append("mountainId", review.mountainId);

    // 리뷰 완료 처리용
    formData.append("paymentItemId", review.paymentItemId);

    files.forEach((file) => {
      formData.append("boardFiles", file);
    });

    try {
      await axios.post(
        `/api/review/write`,

        formData,
      );

      alert("리뷰 등록 완료");

      navigate("/review");
    } catch (error) {
      console.log("리뷰 등록 오류 : ", error);
    }
  };

  return (
    <div className="reviewWrite">
      <div className="reviewWrite-con">
        <h3>크루 리뷰 작성</h3>

        {/* 작성자 */}

        <div className="inputBox">
          <label>작성자</label>
          <span>{member ? member.userName : "로그인 사용자"}</span>
        </div>

        {/* 리뷰 대상 정보 */}

        <div className="inputBox">
          <label>산 항목</label>

          <select value={review.mountainId} onChange={mountainChangeFn}>
            <option value="">산을 선택하세요</option>

            {mountainList.map((item) => (
              <option key={item.paymentItemId} value={item.mountainId}>
                {item.mountainName} ({item.crewName})
              </option>
            ))}
          </select>
        </div>

        {/* 제목 */}
        <div className="inputBox">
          <label>제목</label>
          <input
            type="text"
            name="title"
            value={review.title}
            onChange={changeFn}
            placeholder="제목을 입력하세요"
          />
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
        />

        {/* 버튼 */}
        <div className="btnArea">
          <button className="saveBtn" onClick={saveFn}>
            리뷰 등록
          </button>

          <button
            className="listBtn"
            type="button"
            onClick={() => navigate("/review")}
          >
            목록
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWrite;
