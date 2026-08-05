import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../../css/board/review/reviewDetail.css";
import CommentList from "../../comment/CommentList";
import ReviewCrewInfo from "./ReviewInfo";
import DetailInfo from "../../board/common/DetailInfo"; //게시물 상세-> 공통
import "../../../css/board/boardLayout.css";
const ReviewDetail = () => {
  console.log("ReviewDetail 실행");
  // 게시글 id
  const { id } = useParams();

  // 페이지 이동
  const navigate = useNavigate();


  // 게시글 상태 -> 상세페이지 게시글 1개
  const [board, setBoard] = useState(null);

  // 로그인 회원-> 이메일로 비교
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");

  const loginUserEmail = auth?.isUser?.userEmail;

  // 상세 조회
  const boardDetailFn = async () => {
    if (!id) {
      return;
    }

    try {
      const res = await axios.get(`/api/review/${id}`);

      console.log("상세 데이터 : ", res.data);

      setBoard(res.data);
    } catch (error) {
      console.log("상세 조회 오류 : ", error);
    }
  };

  useEffect(() => {
    boardDetailFn();
  }, [id]);

  if (board === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="reviewDetail">
      <div className="reviewDetail-wrap">
        {/* 제목 */}

        <h2>{board.title}</h2>

        <hr />

        <div className="reviewTop">
          <DetailInfo
            userName={board.userName}
            viewCount={board.viewCount}
            commentCount={board.commentCount ?? 0}
            createTime={board.createTime}
          />

          {board.category === "REVIEW" && (
            <>
              <div className="reviewBox">
                <span>참여 크루 정보</span>
                <ReviewCrewInfo crew={board} />
                <small className="info-text">
                  이미지 클릭시 해당 페이지로 이동합니다
                </small>
              </div>
            </>
          )}
        </div>

        <hr />

        {/* 본문 */}

        <div className="reviewContent">{board.content}</div>

        {/* 이미지 */}

        <div className="reviewImage">
          {board.newFileNames &&
            board.newFileNames.length > 0 &&
            board.newFileNames.map((fileName, index) => (
              <img
                key={index}
                src={fileName}
                alt=""
                style={{
                  width: "300px",
                  marginTop: "20px",
                }}
              />
            ))}
        </div>
        <hr />

        {/* 좋아요 / 댓글 */}

        <div className="reviewAction">
          <button
            className="likeBtn"
            onClick={async () => {
              try {
                await axios.post(`/api/board/${board.id}/like`);

                boardDetailFn();
              } catch (error) {
                console.log(error);
              }
            }}
          >
            ❤️ {board.likeCount}
          </button>

          <span>💬 {board.commentCount ?? 0}</span>
        </div>
        <hr />

        {/* 댓글 */}
        <CommentList boardId={board.id} boardDetailFn={boardDetailFn} />

        {/* 버튼 */}
        <div className="btnArea">
          {board.userEmail === loginUserEmail && (
            <>
              <button
                onClick={() => {
                  navigate(`/review/update/${board.id}`);
                }}
              >
                수정
              </button>

              <button
                onClick={async () => {
                  if (!window.confirm("삭제하시겠습니까?")) {
                    return;
                  }

                  axios
                    .delete(`/api/review/${board.id}`)
                    .then(() => {
                      alert("삭제되었습니다.");

                      navigate("/review");
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}
              >
                삭제
              </button>
            </>
          )}
          <button
            onClick={() => {
              navigate("/review");
            }}
          >
            목록
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
