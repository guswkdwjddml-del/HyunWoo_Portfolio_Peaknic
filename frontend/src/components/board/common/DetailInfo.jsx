 // 작성자, 조회수, 댓글수, 작성일 표시
import React from "react";
const DetailInfo = ({
  userName,
  viewCount,
  commentCount,
  createTime,
}) => {
  return (
    <div className="detailInfo">
      <span>작성자 {userName}</span>

      <span>조회수 {viewCount}</span>

      {commentCount !== undefined && (
        <span>댓글 {commentCount}</span>
      )}

      <span>작성일 {createTime?.substring(0, 10)}</span>
    </div>
  );
};

export default DetailInfo;