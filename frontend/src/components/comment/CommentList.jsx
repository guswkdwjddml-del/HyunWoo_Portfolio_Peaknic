import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentItem from "./CommentItem";
import "../../css/comment/CommentList.css";

const CommentList = ({ boardId }) => {

  const [comments, setComments] = useState([]);

  const auth = JSON.parse(localStorage.getItem("auth") || "{}");

  const loginEmail = auth?.isUser?.userEmail;

  const getComments = async () => {
    try {
      const res = await axios.get(`/api/board/${boardId}/comments`);

      setComments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (boardId) {
      getComments();
    }
  }, [boardId]);

  const addComment = async (content) => {
    try {
      await axios.post(`/api/board/${boardId}/comments`, {
        content: content,
      });

      alert("댓글이 등록되었습니다");

      getComments();
    } catch (err) {
      console.log(err);
    }
  };

  const likeComment = async (commentId) => {
    await axios.post(`/api/comments/${commentId}/like`);

    getComments();
  };

  const deleteComment = async (id) => {
    await axios.delete(`/api/comments/${id}`);

    getComments();
  };

  const updateComment = async (id, content) => {
    await axios.put(`/api/comments/${id}`, {
      content: content,
    });

    getComments();
  };

  return (
    <div className="commentList">
      <h3>댓글</h3>

      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          loginEmail={loginEmail}
          deleteComment={deleteComment}
          updateComment={updateComment}
          likeComment={likeComment}
        />
      ))}

      {/* 작성창은 여기서 따로 호출 */}

      <CommentItem writeMode={true} addComment={addComment} />
    </div>
  );
};

export default CommentList;
