import React, { useState } from "react";
import "../../css/comment/CommentItem.css";

const CommentItem = ({
  comment,
  loginEmail,
  deleteComment,
  updateComment,
  likeComment,
  writeMode,
  addComment,
}) => {
  const [edit, setEdit] = useState(false);

  const [content, setContent] = useState(comment?.content || "");

  // 작성창 모드
  if (writeMode) {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");

    const loginUser = auth?.isUser;

    const submitComment = () => {
      if (!loginUser) {
        alert("로그인 후 이용 가능합니다.");

        return;
      }

      if (content.trim() === "") {
        alert("댓글 내용을 입력해주세요.");

        return;
      }

      addComment(content);

      setContent("");
    };

    return (
      <div className="commentWrite">
        <div className="comment-user">{loginUser?.userName || "비회원"}</div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            loginUser
              ? "댓글을 남겨보세요"
              : "로그인 후 댓글 작성이 가능합니다."
          }
        />

        <button onClick={submitComment}>등록</button>
      </div>
    );
  }

  const isWriter = comment.memberEmail === loginEmail;

  const saveUpdate = () => {
    updateComment(comment.id, content);

    setEdit(false);
  };

  return (
    <div className="commentItem">
      <div className="comment-header">
        <div>작성자 : {comment.memberName}</div>

        <div>{comment.createTime?.substring(0, 10)}</div>
      </div>

      <div className="comment-content">
        {edit ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          comment.content
        )}
      </div>

      <div className="comment-like">
        <button onClick={() => likeComment(comment.id)}>❤️ 좋아요</button>

        <span>{comment.likeCount}</span>
      </div>

      {isWriter && (
        <div className="comment-btn">
          {edit ? (
            <button onClick={saveUpdate}>저장</button>
          ) : (
            <button onClick={() => setEdit(true)}>수정</button>
          )}

          <button onClick={() => deleteComment(comment.id)}>삭제</button>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
