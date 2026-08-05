import React, { useState } from 'react';
import PwCheck from '../../components/mypage/PwCheck';
import Delete from '../../components/mypage/Delete';

const DeletePage = () => {
  // 1: 본인확인, 2: 회원삭제, 3: 메인화면으로 이동
  const [step, setStep] = useState(1); 

  return (
    <div className="info_page_wrap">
      <div className="mypage_page_title">
        <h2>회원 탈퇴</h2>
      </div>

      {/* 🔄 단계별 컴포넌트 조건부 렌더링 */}
      <div className="step_content_area">
        {step === 1 && (
          <PwCheck onNextStep={() => setStep(2)} />
        )}
        
        {step === 2 && (
          <Delete /> // 🌟 임포트 명칭 수정 완료
        )}
      </div>


    </div>
  );
};

export default DeletePage;