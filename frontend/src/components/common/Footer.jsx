import React, { useState } from 'react'
import { Link } from 'react-router'
import Chatbot from '../chatbot/Chatbot';

export const Footer = () => {

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      
      {/* 🌟 우측 하단 고정형 플로팅 액션 버튼(FAB) */}
      <button className="chatbot-fab" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? 
        <img src="/images/icon-chatbot-close.png" alt="닫기아이콘" className="bot_icon_02" />
         : <img src="/images/icon-chatbot.png" alt="로봇아이콘" className="bot_icon_02" /> }
      </button>

      {/* 🌟 챗봇 레이아웃 연동 */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <footer className="footer">
        <div className="footer_wrap">
          <div className="footer_left">
            <ul>
              <li>
                <span>상호명 : 피크닉(Peak-nic)</span>
                <span>대표자명 : 김산타</span>
              </li>
              <li>
                <span>사업자등록번호 : 000-00-00000</span>
                <span>통산판매업신고번호 : 제0000-서울노원-0000호</span>
              </li>
              <li>
                <span>주소 : 서울 노원구 상계로3길 21 화일빌딩 3-6층</span>
              </li>
              <li>
                <span>© 2026 Peak-nic. All rights reserved.</span>
              </li>
            </ul>
          </div>
          <div className="footer_right">
            <ul>
              <li>
                <span>고객센터</span>
                <span>1588-0000</span>
              </li>
              <li>
                <span>본사</span>
                <span>02-000-0000</span>
              </li>
              <li>
                <span>Fax</span>
                <span>000-0000-0000</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
