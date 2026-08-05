import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { formatDateTime } from '../../../utils/commonModule';
import AdminPaymentModal from './AdminPaymentModal';
import AdminPagination from '../common/AdminPagination';
import { adminListConfig } from '../../../js/adminListConfig';
import AdminSearchBar from '../common/AdminSearchBar';

const paymentTypeMap = {
  ACCOUNT: "계좌이체",
  CARD: "신용/체크카드",
  KAKAO: "카카오페이",
  // TOSS: "토스페이",
};

const paymentStatusMap = {
  READY: "결제대기",
  FINISH: "결제완료",
  FAILED: "결제실패",
  CANCELLED: "결제취소",
  EXPIRED: "기간만료",
  REFUND_REQUEST: "환불요청",
  REFUND: "환불완료",
};

const paymentCategoryMap = {
  CREW: "크루",
  SUBSCRIBE: "구독권",
};


const AdminPayment = () => {
  const config = adminListConfig.payment;

  const [paymentList, setPaymentList] = useState([]);
  const [paging, setPaging] = useState({});
  const [page, setPage] = useState(0);
  const [subject, setSubject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("");
  const [paymentCategory, setPaymentCategory] = useState("ALL");

  const paymentListFn = async () => {
    try {
      const res = await axios.get(`/admin/payment`, {
        params: {
          page,
          size: 8,
          sort,
          subject,
          search: searchText,
          paymentCategory
        }
      });
      if (res.data && res.data.paymentListAll) {  //controller에서 보내는 data의 key 값
        setPaymentList(res.data.paymentListAll.content);
        setPaging(res.data.paymentListAll);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    paymentListFn();
  }, [page, sort, subject, searchText, paymentCategory]);

  // 현재 0페이지 → 바로 검색
  // 현재 2페이지 → 0페이지로 이동하면서 useEffect 실행
  const searchFn = () => { if (page === 0) { paymentListFn() } else { setPage(0) } };

  // 페이지 및 검색/정렬config 초기화
  useEffect(() => {
    setSubject(config?.searchFields?.[0]?.value ?? "");
    setSort(config?.sortFields?.[0]?.value ?? "");
  }, []);

  // paymentModal(결제 상세보기/수정) 구현
  const [openModal, setOpenModal] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const paymentModalFn = async (id) => {

    setPaymentId(id);

    try {
      const res = await axios.get(
        `/admin/payment/detail/${id}`
      );
      setPaymentInfo(res.data.payment);
      setOpenModal(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="adminList">
      <div className="adminList-wrap">
        <div className="adminList-title">
          <h1>결제목록</h1>

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
            총 {paging?.totalElements}건의 결제내역이 있습니다.
          </div>
        </div>

        {/* 결제구분 탭 */}
        <div className="adminTab">
          <button
            className={paymentCategory === "ALL" ? "active" : ""}
            onClick={() => {
              setPaymentCategory("ALL");
              setPage(0);
            }}
          >
            전체목록
          </button>

          <button
            className={paymentCategory === "CREW" ? "active" : ""}
            onClick={() => {
              setPaymentCategory("CREW");
              setPage(0);
            }}
          >
            크루
          </button>

          <button
            className={paymentCategory === "SUBSCRIBE" ? "active" : ""}
            onClick={() => {
              setPaymentCategory("SUBSCRIBE");
              setPage(0);
            }}
          >
            구독권
          </button>
        </div>


        {/* 조회목록 */}
        <div className="adminList-table">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>구분</th>
                <th>결제금액(원)</th>
                <th>항목(건)</th>
                <th>결제방법</th>
                <th>결제상태</th>
                <th>결제자(ID)</th>
                <th>주문번호</th>
                <th>등록일자</th>
                <th>보기</th>
              </tr>
            </thead>
            <tbody>
              {paymentList && paymentList.map((payment) => {

                return (
                  <tr         //리스트의 특정 행 클릭시 모달Fn 실행되도록
                    key={payment.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      paymentModalFn(payment.id);
                    }}
                  >
                    <td>{payment.id}</td>
                    <td>{paymentCategoryMap[payment.paymentCategory] ?? payment.paymentCategory}</td>
                    <td>{payment.totalPrice?.toLocaleString()}</td>
                    <td>{payment.paymentItemCount && payment.paymentItemCount > 0 ? payment.paymentItemCount : '-'}</td>
                    <td>{paymentTypeMap[payment.paymentType] ?? payment.paymentType}</td>
                    <td>{paymentStatusMap[payment.paymentStatus] ?? payment.paymentStatus}</td>
                    <td>{payment.memberId}</td>
                    <td>{payment.orderNumber}</td>
                    <td>{formatDateTime(payment.createTime)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          paymentModalFn(payment.id);
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

        {/* paymentModal 창닫기 */}
        {
          openModal &&
          <AdminPaymentModal          //paymentModal로 넘겨줄 data
            paymentId={paymentId}
            paymentInfo={paymentInfo}
            onClose={() => setOpenModal(false)}
            paymentListFn={paymentListFn}
          />
        }
      </div>
    </div>
  )
}

export default AdminPayment
