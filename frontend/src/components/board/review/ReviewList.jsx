import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../css/board/common/listPageCommon.css";//공통css 먼저 import
 //리스트페이지: 공통 css+ 각 페이지 css (공통 jsx는 없음)
import "../../../css/board/review/reviewList.css"; 
import Pagination from "../../../utils/Pagination"; //페이징
import SearchBox from "../../board/common/SearchBox"; //검색창
import "../../../css/board/boardLayout.css";


const ReviewList = ({ memberId }) => {
  const navigate = useNavigate();

  // 리뷰 목록
  const [list, setList] = useState([]);

  // 페이징
  const [paging, setPaging] = useState({});

  // 현재 페이지
  const [page, setPage] = useState(0);

  // 검색 조건
  const [subject, setSubject] = useState("title");

  // 검색어
  const [searchText, setSearchText] = useState("");


  // 리뷰 목록 조회
  const reviewListFn = async () => {
    try {

      const targetUrl = memberId 
        ? `/api/review/myReview` 
        : `/api/review`;

      const res = await axios.get(targetUrl, {
        params: {
          page,
          size: 10,
          subject,
          search: searchText,
          ...(memberId && { memberId: memberId }),
        },
      });

      const data = res.data;

      setList(data?.content ?? []);

      setPaging(data ?? {});
    } catch (error) {
      console.log("리뷰 목록 조회 오류 : ", error);
    }
  };

  // 페이지 / 검색조건 변경 조회
  useEffect(() => {
    reviewListFn();
  }, [page, subject, searchText, memberId]);

  // 상세 이동
  const detailMoveFn = (id) => {
    navigate(`/review/detail/${id}`);
  };

  return (
    <div className="board-List">
      <div className="boardList-wrap">
        {/* 제목 */}
        <div className="board-title">
          <h2>크루 리뷰</h2>
        </div>

        {/* 검색 */}
        <div className="board-top">
          <SearchBox
            options={[
              { value: "title", label: "제목" },
              { value: "writer", label: "작성자" },
              { value: "mountain", label: "산" },
              { value: "content", label: "내용" },
            ]}
            subject={subject}
            setSubject={setSubject}
            searchText={searchText}
            setSearchText={setSearchText}
            setPage={setPage}
          />
        </div>

        {/* 목록 */}
        <div className="board-table review-table">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>제목</th>
                <th>산</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>
                <th>좋아요</th>
              </tr>
            </thead>

            <tbody>
              {list.length > 0 ? (
                list.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => detailMoveFn(item.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.mountainName}</td>
                    <td>{item.userName}</td>
                    <td>
                      {item.createTime ? item.createTime.substring(0, 10) : ""}
                    </td>
                    <td>{item.viewCount}</td>
                    <td>{item.likeCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">게시글이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        <Pagination
          page={page}
          setPage={setPage}
          totalPages={paging.totalPages}
        />
      </div>
    </div>
  );
};
export default ReviewList;
