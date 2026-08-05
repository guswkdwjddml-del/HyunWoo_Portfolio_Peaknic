import React, { useState } from 'react';
import PwCheck from '../../components/mypage/PwCheck';
import Info from '../../components/mypage/Info';
import Login from '../../components/auth/Login';

const InfoPage = () => {
  // 1: 본인확인, 2: 회원정보 수정, 3: 재 로그인
  const [step, setStep] = useState(1); 

  return (
    <div className="info_page_wrap">
      <div className="mypage_page_title">
        <h2>회원정보 수정</h2>
      </div>

      {/* 📢 상단 안내 박스 (1, 2단계에서만 노출) */}
      {step < 3 && (
        <div className="info_guide_box">
          <div className="guide_title">
            <span className="guide_icon">📢</span>
            <strong>안내</strong>
          </div>
          <ul className="guide_list">
            <li>회원정보를 변경하시면 기존 로그인 계정은 보안을 위해 자동 로그아웃 됩니다.</li>
            <li>개인정보 보호를 위해 주기적으로 비밀번호를 변경해 주시는 것이 안전합니다.</li>
            <li>주민등록번호, 생일 등 개인정보와 관련된 숫자는 사용을 피해주십시오.</li>
          </ul>
        </div>
      )}

      {/* 📊 고용24st 단계 표시 진행 바 */}
      <div className="step_progress_bar">
        <div className={`step_item ${step === 1 ? 'active' : ''}`}>
          <span className="step_num">1.</span> 본인확인
        </div>
        <div className={`step_item ${step === 2 ? 'active' : ''}`}>
          <span className="step_num">2.</span> 회원정보 수정
        </div>
        <div className={`step_item ${step === 3 ? 'active' : ''}`}>
          <span className="step_num">3.</span> 재 로그인
        </div>
      </div>

      {/* 🔄 단계별 컴포넌트 조건부 렌더링 */}
      <div className="step_content_area">
        {step === 1 && (
          <PwCheck onNextStep={() => setStep(2)} />
        )}
        
        {step === 2 && (
          <Info onNextStep={() => setStep(3)} />
        )}
        
        {step === 3 && (
          <div className="re_login_container">
            <div className="re_login_notice">
              <h3>회원정보 수정 완료</h3>
              <p>회원정보가 안전하게 변경되었습니다. 변경된 정보로 다시 로그인해 주세요.</p>
            </div>
            {/* 기존에 보유하고 계신 로그인 컴포넌트 호출 */}
            <Login />
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPage;