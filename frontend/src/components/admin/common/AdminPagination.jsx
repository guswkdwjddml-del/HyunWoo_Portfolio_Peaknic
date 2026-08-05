import React from 'react'
// 관리자페이지용 페이징

// -----------   사용방법   -------------- //

// 1. 부모 컴포넌트에서 상태 선언
// const [paging, setPaging] = useState({});
// const [page, setPage] = useState(0);
//
// 2. 서버 응답 후 paging 저장
// setPaging(res.data.memberList);
//
// 3. 리스트 하단에 컴포넌트 사용
// <AdminPagination
//   page={page}
//   setPage={setPage}
//   totalPages={paging.totalPages}
//   blockSize = {5}
// />
//
// page       : 현재 페이지 번호 (0부터 시작)
// setPage    : 페이지 변경 함수
// totalPages : 전체 페이지 수
// blockSize  : 보여줄 페이지번호 갯수
//
// -----------   사용방법   -------------- //

const AdminPagination = ({ page, setPage, totalPages = 0, blockSize = 5 }) => {

  // 현재 페이지 기준 block 시작/끝
  const currentBlock = Math.floor(page / blockSize);
  const startPage = currentBlock * blockSize;
  const endPage = Math.min(startPage + blockSize, totalPages);

  return (
    <div className="paging">
      <button
        onClick={() => setPage(0)}
        disabled={page === 0}
        className="paging_double first"
      >
        &lt;&lt;
      </button>
      <button
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={page === 0}
        className="paging_one prev"
      >
        &lt;
      </button>
      <ul className="page_numbers">
        {Array.from({ length: Math.max(1, endPage - startPage) }, (_, i) => {
          const pageNumber = startPage + i;
          return (
            <li
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={page === pageNumber ? "active" : ""}
            >
              {pageNumber + 1}
            </li>
          )
        },
        )}
      </ul>
      <button
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        disabled={totalPages <= 0 || page === totalPages - 1}
        className="paging_one next"
      >
        &gt;
      </button>
      <button
        onClick={() => setPage(totalPages - 1)}
        disabled={totalPages <= 0 || page === totalPages - 1}
        className="paging_double last"
      >
        &gt;&gt;
      </button>
    </div>
  )
}

export default AdminPagination
