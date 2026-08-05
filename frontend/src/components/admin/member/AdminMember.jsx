import React, { useEffect, useState } from 'react'
import axios from 'axios';
import AdminMemberModal from './AdminMemberModal';
import { formatDateTime } from '../../../utils/commonModule';
import AdminPagination from '../common/AdminPagination';
import { adminListConfig } from '../../../js/adminListConfig';
import AdminSearchBar from '../common/AdminSearchBar';

const AdminMember = () => {
  const config = adminListConfig.member;

  const [memberList, setMemberList] = useState([]);
  const [paging, setPaging] = useState({});
  const [page, setPage] = useState(0);
  const [subject, setSubject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("");

  const memberListFn = async () => {
    try {
      const res = await axios.get(`/admin/member`, {
        params: {
          page,
          size: 8,
          sort,
          subject,
          search: searchText
        }
      });
      if (res.data?.memberList) {  //controller에서 보내는 data의 key 값
        setMemberList(res.data.memberList.content);
        setPaging(res.data.memberList);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    memberListFn();        //검색어 작성과 동시에 리스트 정렬
  }, [page, sort, subject, searchText]);

  // 페이지 및 검색/정렬config 초기화
  useEffect(() => {
    setSubject(config?.searchFields?.[0]?.value ?? "");
    setSort(config?.sortFields?.[0]?.value ?? "");
  }, []);

  // 현재 0페이지 → 바로 검색
  // 현재 2페이지 → 0페이지로 이동하면서 useEffect 실행
  const searchFn = () => { if (page === 0) { memberListFn() } else { setPage(0) } };

  // memberModal(회원 추가/수정/상세보기) 구현
  const [openModal, setOpenModal] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);

  //회원 상세 불러오기는 userEmail로, 수정/삭제는 id로
  const memberModalFn = async (userEmail = null, id = null) => {

    setMemberId(id);

    // 신규 회원 등록
    if (id === null && userEmail === null) {
      setMemberInfo(null);
      setOpenModal(true);
      return;
    }

    try {
      const res = await axios.get(
        `/admin/member/detail/${userEmail}`
      );
      setMemberInfo(res.data.member);
      setOpenModal(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="adminList">
      <div className="adminList-wrap">
        <div className="adminList-title">
          <h1>회원목록</h1>
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
            총 {paging?.totalElements}명의 회원이 있습니다.
          </div>

          {/* 회원추가 버튼 */}
          <div className="admin-write-btn">
            <button onClick={() => memberModalFn(null, null)}>회원등록</button>
          </div>
        </div>

        {/* 조회목록 */}
        <div className="adminList-table">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>이메일</th>
                <th>성별</th>
                <th>전화번호</th>
                <th>주소</th>
                <th>자기소개</th>
                <th>등산 레벨</th>
                <th>권한</th>
                <th>등록일자</th>
                <th>보기</th>
              </tr>
            </thead>
            <tbody>
              {memberList && memberList.map((member) => {
                return (
                  <tr         //리스트의 특정 행 클릭시 모달Fn 실행되도록
                    key={member.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      memberModalFn(member.userEmail, member.id);
                    }}
                  >
                    <td>{member.id}</td>
                    <td>{member.userName}</td>
                    <td>{member.userEmail}</td>
                    <td>{member.gender}</td>
                    <td>{member.phone}</td>
                    <td>{member.address}</td>
                    <td>{member.memberDetail}</td>
                    <td>{member.hikingLevel}</td>
                    <td>{member.role}</td>
                    <td>{formatDateTime(member.createTime)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          memberModalFn(member.userEmail, member.id);
                        }}
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

        {/* memberModal 창닫기 */}
        {
          openModal &&
          <AdminMemberModal          //memberModal로 넘겨줄 data
            memberId={memberId}
            memberInfo={memberInfo}
            onClose={() => setOpenModal(false)}
            memberListFn={memberListFn}
          />
        }
      </div>
    </div>
  )
}

export default AdminMember
