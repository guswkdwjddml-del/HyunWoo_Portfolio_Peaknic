import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logoutF } from '../../store/slice/authSlice';
import axios from 'axios';

const PwChange = ({ onNextStep }) => {
  const dispatch = useDispatch();

  // 🌟 오타 방지용 '비밀번호 확인(confirmPassword)' 필드 추가
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // 🌟 오류 수정: 누락되었던 input 입력 핸들러 함수 정의
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.password.trim()) {
      alert('비밀번호는 필수 항목입니다.');
      return;
    }
    if (formData.password.length < 4) {
      alert('비밀번호는 최소 4글자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      // 1. 백엔드 수정 API 호출 (만들어둔 api 인스턴스 사용으로 토큰 자동 헤더 주입 및 연장 작동)
      // 백엔드 엔드포인트에 맞게 DTO 규격으로 password 전달
      await axios.put('/api/member/updatepw', { password: formData.password });

      alert('비밀번호 수정이 완료되었습니다. 안전한 세션을 위해 다시 로그인해 주세요.');

      // 2. 백엔드 로그아웃 실행 및 프론트엔드 세션 클리어
      await axios.post('/api/member/logout');
      
      dispatch(logoutF());
      
      // 로컬 스토리지에 남아있는 구인증 정보 말끔히 청소
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      
      // 3. 3단계(재 로그인) 화면으로 전환
      onNextStep();
    } catch (error) {
      console.error('정보 수정 실패:', error);
      alert('정보 수정에 실패했습니다. 시스템 관리자에게 문의해 주세요.');
    }
  };

  // 🌟 오류 수정: 불필요한 무한 로딩(loading === true) 조건문 제거

  return (
    <div className="step_form_box">
      <div className="form_box_header">
        <h3>개인회원 정보 수정</h3>
        <span className="required_notice"><span className="dot">•</span> 표시된 부분은 필수 입력 항목입니다.</span>
      </div>

      <form onSubmit={handleInfoSubmit} className="mypage_form">
        
        {/* 새 비밀번호 입력 */}
        <div className="input_inline_group">
          <label htmlFor="password">새 비밀번호(최소4글자) <span className="red_dot">*</span></label>
          <div className="input_input_input_btn_wrapper">
            <input
              type="password"
              id="password"
              placeholder="새로운 비밀번호를 입력해주세요."
              value={formData.password}
              onChange={handleInputChange}
              className="mypage_input"
            />
          </div>
        </div>

        {/* 새 비밀번호 확인 입력 (보안/UX 강화) */}
        <div className="input_inline_group">
          <label htmlFor="confirmPassword">새 비밀번호 확인 <span className="red_dot">*</span></label>
          <div className="input_input_input_btn_wrapper">
            <input
              type="password"
              id="confirmPassword"
              placeholder="새로운 비밀번호를 한 번 더 입력해주세요."
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="mypage_input"
            />
          </div>
        </div>

        <div className="form_action_row">
          <button type="submit" className="form_submit_btn info_save">수정 완료</button>
        </div>
      </form>
    </div>
  );
};

export default PwChange;