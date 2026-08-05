import React, { useEffect, useState } from 'react';
import { adminListConfig } from '../../../js/adminListConfig';
import axios from 'axios';
import AdminSearchBar from '../common/AdminSearchBar';
import AdminPagination from '../common/AdminPagination';
import { useNavigate } from 'react-router-dom';

const AdminMountain = () => {

  const config = adminListConfig.mountain;

  const navigate = useNavigate();
  const [mountainList, setMountainList] = useState();
  const [paging, setPaging] = useState({});
  const [page, setPage] = useState(0);
  const [subject, setSubject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("");
  const [filters, setFilters] = useState({ noImg: false, noDescription: false });

  const mountainListFn = async () => {
    try {
      const res = await axios.get(`/admin/mountain`, {
        params: {
          page,
          size: 8,
          sort,
          subject,
          search: searchText,
          noImg: filters.noImg,
          noDescription: filters.noDescription,
        }
      });
      if (res.data?.mountainList) {
        setMountainList(res.data.mountainList.content);
        setPaging(res.data.mountainList);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // 페이지 및 검색/정렬config 초기화
  useEffect(() => {
    setSubject(config?.searchFields?.[0]?.value ?? "");
    setSort(config?.sortFields?.[0]?.value ?? "");
  }, []);

  const searchFn = () => { if (page === 0) { mountainListFn() } else { setPage(0) } };

  useEffect(() => {
    mountainListFn();
  }, [page, sort, filters, subject, searchText]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <div className="adminList">
      <div className="adminList-wrap">
        <div className="adminList-title">
          <h1>산목록</h1>
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
            총 {paging?.totalElements}건의 산정보가 있습니다.
          </div>

          <div className="right-wrap">
            <label className='adminList-check'>
              <input type="checkbox" name="noImg"
                checked={filters.noImg}
                onChange={handleInputChange}
              />
              이미지없음
            </label>
            <label className='adminList-check'>
              <input type="checkbox" name="noDescription"
                checked={filters.noDescription}
                onChange={handleInputChange}
              />
              산소개없음
            </label>
          </div>
        </div>

        {/* 조회목록 */}
        <div className="adminList-table adminMountain-table">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>산코드</th>
                <th>산이름</th>
                <th>소재지</th>
                <th>높이(m)</th>
                <th>산소개</th>
                <th>이미지</th>
                <th>즐겨찾기</th>
                <th>보기</th>
              </tr>
            </thead>
            <tbody>
              {mountainList && mountainList.map((mountain) => {
                return (
                  <tr               //리스트의 특정 행 클릭시 상세보기 페이지
                    key={mountain.id}
                    onClick={() => navigate(`/admin/mountain/detail/${mountain.id}`)}
                  >
                    <td>{mountain.id}</td>
                    <td>{mountain.mountainCode}</td>
                    <td><div className="mountain-name">{mountain.mountainName}</div></td>
                    <td>{mountain.sido} {mountain.sigungu}</td>
                    <td>{mountain.height}</td>
                    <td><div className="mountain-description">{mountain.description}</div></td>
                        {/* 이미지 URL 또는 첨부파일 있을 경우 */}
                    <td>{mountain.imageUrl || mountain.newFileName ? "🏞️" : "-"}</td> 
                    <td>{mountain.bookmarkCount}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-detail"
                        onClick={() => navigate(`/admin/mountain/detail/${mountain.id}`)}
                      >
                        보기
                      </button>
                    </td>
                  </tr>
                )
              }
              )}
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
    </div>
  )
}

export default AdminMountain