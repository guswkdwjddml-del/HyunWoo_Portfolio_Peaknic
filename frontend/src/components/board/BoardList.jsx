import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../../css/board/common/listPageCommon.css"; //공통 css 먼저 import
//리스트페이지: 공통 css+ 각 페이지 css (공통 jsx는 없음)
import "../../css/board/boardList.css"; 
import { decodeToken } from "../../js/jwtUtils"; //권한별 버튼
import Pagination from "../../utils/Pagination"; //페이징
import SearchBox from "./common/SearchBox"; //검색창
import "../../css/board/boardLayout.css";


// 2026.07.20_김현우작성_memberId 넘겨서 자신의 글목록 가져오기
const BoardList = ({ memberId }) => {
  // URL(category) 가져오기
  const { category } = useParams();

  // 좋아요 가리기
  const showLike = category !== "notice" && category !== "faq";

  // (notice/faq) 게시글 등록 버튼-> 관리자만 보이게
  const token = localStorage.getItem("accessToken");
  const payload = decodeToken(token);

  const userRole = payload?.role || payload?.userRole || payload?.auth;
  const isAdmin = userRole === "ADMIN" || userRole === "ROLE_ADMIN";

  // 페이지 이동
  const navigate = useNavigate();

  //  게시글 목록
  const [list, setList] = useState([]);

  //  페이징 정보
  const [paging, setPaging] = useState({});

  //   페이지 (현재, 바뀔 페이지)
  const [page, setPage] = useState(0);

  // 검색 조건
  const [subject, setSubject] = useState("title");

  // 실제 검색어
  const [searchText, setSearchText] = useState("");


  // 카테고리 제목
  const categoryTitle = {
    notice: "공지사항",
    faq: "FAQ",
    free: "자유게시판",
  };

  //백엔드에서 데이터 요청
  const boardListFn = async () => {
    try {
      const res = await axios.get(`/api/board`, {
        params: {
          category: category?.toUpperCase(),
          // 2026.07.20_김현우작성_memberId 넘겨서 자신의 글목록 가져오기
          memberId,
          page,
          size: 5,
          subject,
          search: searchText,
        },
      });

      setList(res.data?.content ?? []);
      setPaging(res.data ?? {});
    } catch (err) {
      console.log("API ERROR:", err);
    }
  };

  // 처음 실행 + 카테고리 변경 + 페이지 변경

  useEffect(() => {
    if (!category && !memberId) return;

    boardListFn();
  }, [category, page, memberId, subject, searchText]);

  // 카테고리 변경 시 첫 페이지

  useEffect(() => {
    setPage(0);
  }, [category]);

  //관리자 권한 접속시에만 버튼 보이기

  const canWrite = () => {
    if (memberId) return false;

    if (category === "notice" || category === "faq") {
      return isAdmin;
    }

    return true;
  };

  // 화면 구성

  return (
    <div className="board-List">
      <div className="boardList-wrap">
        {/* 제목 */}
        {/* 2026.07.20_김현우작성_memberId mypage에서 타이틀 없애기*/}
        {!memberId && (
          <div className="board-title">
            <h2>{categoryTitle[category] ?? "게시판"}</h2>
          </div>
        )}

        {/* 검색 + 등록 영역 */}
        <div className="board-top">
          <SearchBox
            options={[
              { value: "title", label: "제목" },
              { value: "content", label: "내용" },
            ]}
            subject={subject}
            setSubject={setSubject}
            searchText={searchText}
            setSearchText={setSearchText}
            setPage={setPage}
          />

          {canWrite() && (
            <button
              className="board-write-btn"
              onClick={() => navigate(`/board/save?category=${category}`)}
            >
              게시글 등록
            </button>
          )}
        </div>

        {/* 게시글 테이블 */}
        <div className="board-table">
          <table>
            <thead>
              <tr>
                <th className="num">번호</th>
                <th className="subject">제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>

                {showLike && <th>좋아요</th>}
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() =>
                      navigate(`/board/detail/${item.id}?category=${category}`)
                    }
                  >
                    <td className="num">{item.id}</td>
                    <td className="subject">{item.title}</td>
                    <td>{item.userName}</td>
                    <td>{item.createTime?.substring(0, 10)}</td>
                    <td>{item.viewCount}</td>

                    {showLike && <td>{item.likeCount}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showLike ? 6 : 5}>게시글이 없습니다.</td>
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
export default BoardList;
