import React from "react";
// 공용 페이징
// pageBlockSize 기본 5개, 컴포넌트에서 임포트하고 상태값 변경해서 사용

// -----------   사용방법   -------------- //
// 1. 상태선언
// const [page, setPage] = useState(0);

// 2. 리턴문에 임포트하기
{/* 
<Pagination
  page={page}
  setPage={setPage}
  totalPages={data.totalPages}
/> 
*/}
// -----------   사용방법   -------------- //

const Pagination = ({ page, totalPages = 0, setPage, pageBlockSize = 5 }) => {
  // 데이터가 없을(null) 경우에도 페이지 수(1)가 보이도록 최소값을 1로 보정합니다.
  const displayTotalPages = Math.max(1, totalPages);

  // 현재 페이지 기준 블록(1~5 , 6~10,, ) 시작과 끝  계산
  const currentBlock = Math.floor(page / pageBlockSize);
  const startPage = currentBlock * pageBlockSize;
  const endPage = Math.min(startPage + pageBlockSize, displayTotalPages);

  // 화면의 보여주는 페이지 번호 배열 생성
  const pageNumbers = [];
  for (let i = startPage; i < endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="paging">
      {/* 처음으로 */}
      <button
        onClick={() => setPage(0)}
        disabled={page === 0}
        className="paging_double first"
      >
        &lt;&lt;
      </button>

      {/* 이전 블록(5페이지 앞)으로 이동 */}
      <button
        onClick={() => setPage(Math.max(0, startPage - 1))}
        disabled={startPage === 0}
        className="paging_one prev"
      >
        &lt;
      </button>

      {/* 페이지 번호 목록 */}
      <ul className="page_numbers">
        {pageNumbers.map((i) => (
          <li
            key={i}
            onClick={() => setPage(i)}
            className={page === i ? "active" : ""}
            style={{ cursor: "pointer" }}
          >
            {i + 1}
          </li>
        ))}
      </ul>

      {/* 다음 블록(5페이지 뒤)으로 이동 */}
      <button
        onClick={() => setPage(Math.min(displayTotalPages - 1, endPage))}
        disabled={endPage >= displayTotalPages}
        className="paging_one next"
      >
        &gt;
      </button>

      {/* 마지막으로 */}
      <button
        onClick={() => setPage(displayTotalPages - 1)}
        disabled={displayTotalPages <= 0 || page === displayTotalPages - 1}
        className="paging_double last"
      >
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;