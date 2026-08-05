import React from 'react';
import { NavLink } from 'react-router-dom';
import "../../css/board/boardLeftcon.css";
import "../../css/board/boardLayout.css";

const BoardLeftcon = () => {
  return (
    <div className="boardLeft">
      <div className="boardLeft-con">

        <ul>
        <li>
          <NavLink to="/board/notice">공지사항</NavLink>
        </li>

        <li>
          <NavLink to="/board/faq">FAQ</NavLink>
        </li>

        <li>
          <NavLink to="/board/free">자유게시판</NavLink>
        </li>
        
        </ul>
      </div>
    </div>
  );
};

export default BoardLeftcon;