import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import DetailInfo from "../board/common/DetailInfo"; //게시물 상세-> 공통 
import "../../css/board/boardListDetail.css";
import CommentList from "../comment/CommentList";
import "../../css/board/boardLayout.css";

const BoardListDetail = () => {
  // 게시글 id
  const { id } = useParams();

  // 페이지 이동
  const navigate = useNavigate();

  // 게시글 상태
  const [board, setBoard] = useState(null);

  // 좋아요 회원 목록
  const [likeMembers, setLikeMembers] = useState([]);

  // 로그인 회원-> 이메일로 비교
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const loginUserEmail = auth?.isUser?.userEmail;

  // 게시글 상세 조회
  const boardDetailFn = async () => {
    try {
      const res = await axios.get(`/api/board/${id}`);

      console.log(res.data);

      setBoard(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    boardDetailFn();
  }, [id]);

  if (!board) {
    return <div>Loading...</div>;
  }

  return (
    <div className="boardDetail">
      {/* 제목 */}
      <h2>{board.title}</h2>

      <hr />

      {/* 게시글 상세 정보-> 공통 사용 */}
      <DetailInfo
        userName={board.userName}
        viewCount={board.viewCount}
        commentCount={board.commentCount ?? 0}
        createTime={board.createTime}
      />


      {/* 본문 */}
      <div className="boardContent_p"><p>{board.content}</p></div>

      {/* 이미지 */}
      <div className="boardImage">
        {board.newFileNames?.map((fileName, index) => (
          <img
            key={index}
            src={`${fileName}`}
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
      <div className="boardAction">
        <button
          className="likeBtn"
          onClick={() => {
            axios
              .post(`/api/board/${board.id}/like`)
              .then(() => {
                boardDetailFn();
              })
              .catch(console.log);
          }}
        >
          ❤️ {board.likeCount}
        </button>

        <span>💬 {board.commentCount ?? 0}</span>
      </div>

      <hr />

      {/* 댓글 */}
      <CommentList boardId={board.id} boardDetailFn={boardDetailFn} />

      <hr />

      {/* 버튼 */}
      <div className="btnArea">
        {board.userEmail === loginUserEmail && (
          <>
            <button
              onClick={() => {
                navigate(`/board/update/${board.id}`);
              }}
            >
              수정
            </button>

            <button
              onClick={() => {
                if (!window.confirm("삭제하시겠습니까?")) 
                  return;
              

                axios
                  .delete(`/api/board/${board.id}`)
                  .then(() => {
                    alert("삭제되었습니다.");

                    navigate(`/board/${board.category.toLowerCase()}`);
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
            navigate(`/board/${board.category.toLowerCase()}`);
          }}
        >
          목록
        </button>
      </div>
    </div>
  );
};

export default BoardListDetail;
