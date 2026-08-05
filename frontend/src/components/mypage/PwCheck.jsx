import React, { useState } from 'react';
import axios from 'axios';

const PwCheck = ({ onNextStep }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // 중복 클릭 방지용 로딩 상태

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 4) {
      alert('비밀번호는 최소 4글자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      
      // 🔄 백엔드로 현재 비밀번호 검증 요청 (헤더에 토큰은 Axios 공통 설정으로 주입되어 있다고 가정)
      const response = await axios.post(`/api/member/check-password`, {
        password: password,
      });

      if (response.data.success) {
        // 검증 성공 시 부모 컴포넌트의 setStep(2) 실행
        onNextStep();
      }
    } catch (error) {
      console.error('비밀번호 확인 실패:', error);
      // 백엔드에서 보낸 400 에러 메시지("비밀번호가 일치하지 않습니다.") 가 있으면 출력, 없으면 기본 에러 출력
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('비밀번호 확인 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step_form_box">
      <div className="form_box_header">
        <h3>본인확인</h3>
        <span className="required_notice"><span className="dot">•</span> 표시된 부분은 필수 입력 항목입니다.</span>
      </div>

      <form onSubmit={handleSubmit} className="mypage_form">
        <div className="input_inline_group">
          <label htmlFor="current_pw">
            현재 비밀번호 <span className="red_dot">*</span>
          </label>
          <div className="input_input_input_btn_wrapper">
            <input
              type="password"
              id="current_pw"
              placeholder="현재 비밀번호를 입력해주세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mypage_input"
              disabled={loading}
            />
            {password && !loading && (
              <button 
                type="button" 
                className="input_clear_btn" 
                onClick={() => setPassword('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="form_action_row">
          <button type="submit" className="form_submit_btn" disabled={loading}>
            {loading ? '확인 중...' : '확인'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PwCheck;