import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoticeWidget = ({ data }) => {

  const navigate = useNavigate();

  return (
    <div
      className="noticeWidget clickable"
      onClick={() => navigate(`/admin/board/notice`)}
    >

      <h3>최근 공지사항</h3>

      <div className="noticeTableWrap">
        <table className="noticeTable">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>내용</th>
              <th>등록일</th>
            </tr>
          </thead>

          <tbody>
            {
              data?.map(notice => (
                <tr key={notice.id}>
                  <td>
                    {notice.id}
                  </td>
                  <td>
                    {notice.title}
                  </td>
                  <td>
                    {notice.content}
                  </td>
                  <td>
                    {new Date(notice.createTime)
                      .toLocaleDateString()}
                  </td>
                </tr>
              ))
            }
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default NoticeWidget;