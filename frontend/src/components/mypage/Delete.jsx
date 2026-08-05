import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutF } from '../../store/slice/authSlice';
import axios from 'axios';

const Delete = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDeleteSubmit = async () => {
    // 최종 의사 확인
    const isConfirmed = window.confirm(
      "정말 탈퇴하시겠습니까?\n탈퇴 시 모든 회원 정보 및 활동 내역이 영구 삭제되며 복구할 수 없습니다."
    );

    if (!isConfirmed) return;

    try {

      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/auth/login');
        return;
      }

      await axios.delete(`/api/member/delete`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert('회원 탈퇴가 완료되었습니다. 그동안 서비스를 이용해 주셔서 감사합니다.');

      // 2. 프론트엔드 세션 및 인증 정보 클리어
      dispatch(logoutF());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');  
      localStorage.removeItem('userEmail');
      delete axios.defaults.headers.common.Authorization;

      // 3. 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="delete_page_wrap">

      <div className="delete_content_container">
        {/* 🚪 상단 대형 탈퇴 확인 아이콘 영역 */}
        <div className="delete_status_icon_box">
          <div className="icon_circle">
            {/* 고용24st 탈퇴 도어 아이콘 심볼화 */}
            <img src='/images/ico_secession.svg' alt='문아이콘' />
          </div>
          <h3 className="delete_main_question">정말 탈퇴를 하실건가요?</h3>
        </div>

        {/* 📝 회원 탈퇴 요청 전 확인사항 안내 박스 */}
        <div className="delete_notice_section">
          <h4>① 회원 탈퇴 요청 전 확인사항</h4>
          
          <div className="delete_info_box">
            <p className="bold_text">회원 탈퇴 시 서비스 이용에 제약이 있을 수 있습니다.</p>
            <ul className="bullet_list">
              <li>회원 아이디가 삭제되어 로그인 할 수 없습니다.</li>
            </ul>

            <p className="bold_text margin_top_20">삭제된 정보는 이후 재가입하여도 복구되지 않습니다.</p>
            <div className="badge_info_row">
              <span className="orange_badge">삭제 정보</span>
              <p className="badge_desc_text">
                회원정보(ID, 성명 등), 회원 게시글, 즐겨찾기, 스크랩 목록 등 관심정보 게시판 정보 등
              </p>
            </div>

            <p className="bold_text margin_top_20">재가입 하시는 경우 기존 민원 신청 내역은 확인하실 수 있습니다.</p>
          </div>
        </div>

        {/* 🔘 하단 액션 버튼 그룹 */}
        <div className="delete_action_row">
          <button 
            type="button" 
            className="btn_cancel" 
            onClick={() => navigate(-1)}
          >
            취소
          </button>
          <button 
            type="button" 
            className="btn_withdraw" 
            onClick={handleDeleteSubmit}
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default Delete;