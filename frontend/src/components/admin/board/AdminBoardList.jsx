import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BACK_SERVER_URL, formatDateTime } from '../../../utils/commonModule';
import AdminPagination from '../common/AdminPagination';
import { adminListConfig } from '../../../js/adminListConfig';
import AdminSearchBar from '../common/AdminSearchBar';

const AdminBoardList = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const config = adminListConfig.board[category];

  const [boardList, setBoardList] = useState([]);
  const [paging, setPaging] = useState({});
  const [page, setPage] = useState(0);
  const [subject, setSubject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("");

  // 좋아요 컬럼 표시 여부
  const showLikeCount = ["free", "review"].includes(category);

  const boardListFn = async () => {
    try {
      const res = await axios.get(`${API_BACK_SERVER_URL}/admin/board`, {
        params: {
          category: category.toUpperCase(),
          page,
          size: 8,
          subject,
          search: searchText,
          sort
        }
      });
      if (res.data?.boardList) {  //controller에서 보내는 data의 key 값
        setBoardList(res.data.boardList.content);
        setPaging(res.data.boardList);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    boardListFn();                  //검색어 작성과 동시에 리스트 정렬
  }, [category, page, sort, subject, searchText]);


  // 현재 0페이지 → 바로 검색
  // 현재 2페이지 → 0페이지로 이동하면서 useEffect 실행
  const searchFn = () => {
    if (page === 0) { boardListFn() } else { setPage(0) }
  }

  // 카테고리변경시 페이지 및 검색/정렬config 초기화
  useEffect(() => {
    setPage(0);

    setSubject(
      config?.searchFields?.[0]?.value ?? ""
    );

    setSort(
      config?.sortFields?.[0]?.value ?? ""
    );

  }, [category]);

  return (
    <div className="adminList">
      <div className="adminList-wrap">
        <div className="adminList-title">
          <h1>{config?.title ?? "게시글 목록"}</h1>

          {/* 검색/정렬 */}
          <AdminSearchBar
            searchFields={config?.searchFields ?? []}
            sortFields={config?.sortFields ?? []}
            subject={subject}
            setSubject={setSubject}
            searchText={searchText}
            setSearchText={setSearchText}
            sort={sort}
            setSort={setSort}
            onSearch={searchFn}
          />
        </div>

        {/* 상단 툴바 */}
        <div className="adminList-toolbar">
          <div className="adminList-count">
            총 {paging?.totalElements}건의 게시글이 있습니다.
          </div>

          {/* 게시글 등록 버튼 */}
          <div className="admin-write-btn">
            {(category === 'notice' || category === 'faq') && (
              <button onClick={() => navigate(`/admin/board/${category}/write`)}>
                글쓰기
              </button>
            )}
          </div>
        </div>

        {/* 조회목록 */}
        <div className="adminList-table">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>제목</th>
                <th>내용</th>
                <th>작성자</th>
                <th>조회수</th>
                {showLikeCount && <th>추천수</th>}
                <th>파일</th>
                <th>등록일자</th>
                <th>보기</th>
              </tr>
            </thead>
            <tbody>
              {boardList && boardList.map((board) => {
                return (
                  <tr         //리스트의 특정 행 클릭시 상세보기 페이지
                    key={board.id}
                    onClick={() => navigate(`/admin/board/${category}/detail/${board.id}`)}
                  >
                    <td>{board.id}</td>
                    <td>{board.title}</td>
                    <td>{board.content}</td>
                    <td>{board.userName}</td>
                    <td>{board.viewCount}</td>
                    {showLikeCount && (
                      <td>{board.likeCount}</td>
                    )}
                    <td>{board.attachFile ? "📄" : "-"}</td>
                    <td>{formatDateTime(board.createTime)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-detail"
                        onClick={() => navigate(`/admin/board/${category}/detail/${board.id}`)}
                      >
                        보기</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* 페이징 처리 */}
        <AdminPagination
          page={page}
          setPage={setPage}
          totalPages={paging.totalPages}
          blockSize={5}
        />
      </div>
    </div >
  )
}

export default AdminBoardList
