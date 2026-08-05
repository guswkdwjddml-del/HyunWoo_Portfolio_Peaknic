import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { jwtDecode } from 'jwt-decode';

const Chatbot = ({ isOpen, onClose }) => {
  const authState = useSelector((state) => state.auth);
  
  const [userEmail, setUserEmail] = useState('guest@test.com');
  const isGuest = userEmail === 'guest@test.com';

  const [activeMode, setActiveMode] = useState('GEMINI');

  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '안녕하세요! 피크닉(Peak-nic) AI 가이드입니다. Gemini AI 질문, 산 검색, 나의 일정 서비스를 이용해보세요!', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]); 
  const [inputValue, setInputValue] = useState(''); 
  const [isConnected, setIsConnected] = useState(false); 
  
  const [isLoading, setIsLoading] = useState(false);

  const stompClientRef = useRef(null);
  const messageEndRef = useRef(null);

  const getEmailFromToken = () => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const emailFromJwt = decoded.userEmail || decoded.email || decoded.sub;
        if (emailFromJwt && emailFromJwt.trim() !== '') {
          return emailFromJwt;
        }
      } catch (error) {
        console.error("챗봇 토큰 디코딩 실패:", error);
      }
    }

    const directLocalEmail = localStorage.getItem("userEmail");
    if (directLocalEmail && directLocalEmail.trim() !== '') {
      return directLocalEmail;
    }

    const reduxEmail = authState?.userEmail || authState?.isUser?.userEmail || authState?.user?.email;
    if (reduxEmail && reduxEmail.trim() !== '') {
      return reduxEmail;
    }

    return 'guest@test.com';
  };

  useEffect(() => {
    if (isOpen) {
      const extractedEmail = getEmailFromToken();
      setUserEmail(extractedEmail);
    }
  }, [isOpen, authState?.isState]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const socket = new SockJS(`/back/ws-stomp`);
    
    const client = new Client({
      webSocketFactory: () => socket,
      debug: () => {}, 
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
    });

    client.onConnect = (frame) => {
      console.log(`RabbitMQ STOMP 연결 성공! [구독 계정: ${userEmail}]`);
      setIsConnected(true);

      const subscriptionDestination = `/queue/chatbot.reply.${userEmail}`;
      
      client.subscribe(subscriptionDestination, (message) => {
        if (message.body) {
          const responseData = JSON.parse(message.body);
          setIsLoading(false);

          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: responseData.botMessage,
              messageType: responseData.messageType,
              mountainData: responseData.mountainData,
              scheduleData: responseData.scheduleData,
              time: responseData.timestamp || getCurrentTime()
            },
          ]);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP 프로토콜 에러 발생: ' + frame.headers['message']);
      setIsLoading(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        console.log('STOMP 연결 해제됨');
      }
    };
  }, [userEmail, isOpen]);

  const handleGeminiModeClick = () => {
    setActiveMode('GEMINI');
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: '✨ 제미나이 AI 등산 가이드입니다. 등산/산지 날씨/준비물 등 무엇이든 물어보세요!', time: getCurrentTime() }
    ]);
  };

  const handleMountainSearchClick = () => {
    setActiveMode('MOUNTAIN');
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: '⛰️ 산 검색 모드', time: getCurrentTime() },
      { sender: 'bot', text: '정보를 찾고 싶은 산 이름을 입력해 주세요.', time: getCurrentTime() }
    ]);
  };

  const handleScheduleHistoryClick = () => {
    if (!isConnected) return;
    setActiveMode('SCHEDULE');

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: '나의 일정 조회', time: getCurrentTime() }
    ]);

    if (isGuest) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '🔒 [나의 일정 조회]은 로그인 후 이용 가능한 서비스입니다.', time: getCurrentTime() }
      ]);
      return;
    }

    setIsLoading(true);

    stompClientRef.current.publish({
      destination: '/app/chatbot.message',
      body: JSON.stringify({
        userEmail: userEmail,
        message: 'COMM_SHOW_SCHEDULE',
        mode: 'SCHEDULE'
      }),
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected || isLoading || activeMode === 'SCHEDULE') return;

    const chatMessageDto = {
      userEmail: userEmail,
      message: inputValue,
      mode: activeMode
    };

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: inputValue, time: getCurrentTime() }
    ]);

    setIsLoading(true);

    stompClientRef.current.publish({
      destination: '/app/chatbot.message',
      body: JSON.stringify(chatMessageDto),
    });

    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-container">
      {/* 헤더 영역 */}
      <div className="chatbot-header">
        <div className="chatbot-header-titlebox">
          <img src="/images/icon-chatbot.png" alt="로봇아이콘" className="bot_icon_01" /> 
          <h3>픽봇(Peak-Bot)</h3>
        </div>
        <button className="chatbot-close-btn" onClick={onClose}>&times;</button>
      </div>

      {/* 상태바 */}
      <div className={`chatbot-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '● 서비스 정상 연결됨' : '○ 서버 연결 중...'} | 계정: {isGuest ? '비회원' : userEmail}
      </div>
      
      {/* 대화 화면 */}
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble-wrap ${msg.sender}`}>

            {/* 일반 텍스트 또는 모드 안내 문구 */}
            {msg.text && <div className="chat-bubble">{msg.text}</div>}

            {/* 산 정보 카드 렌더링 */}
            {msg.messageType === 'MOUNTAIN_CARD' && msg.mountainData && (
              <div className="mountain-card">
                <div className="card-header">
                  <h4>⛰️ {msg.mountainData.mountainName}</h4>
                  <span className="badge">{msg.mountainData.height}m</span>
                </div>
                
                <div className="card-body">
                  <p>📍 <strong>위치:</strong> {msg.mountainData.location}</p>
                  <p>📝 <strong>특징:</strong> {msg.mountainData.description}</p>
                </div>

                <div className="card-weather-box">
                  <div className="weather-title">⛅ 실시간 산지 날씨</div>
                  <div className="weather-info-grid">
                    <div><span>상태</span> <strong>{msg.mountainData.weatherDesc}</strong></div>
                    <div><span>기온</span> <strong>{msg.mountainData.temperature}</strong></div>
                    <div><span>습도</span> <strong>{msg.mountainData.humidity}%</strong></div>
                  </div>
                  <div className="weather-source">출처: {msg.mountainData.weatherSource}</div>
                </div>
              </div>
            )}

            {/* 🌟 [신규 추가] 나의 일정 정보 카드 렌더링 */}
            {msg.messageType === 'SCHEDULE_CARD' && msg.scheduleData && (
              <div className="schedule-card-list">
                {msg.scheduleData.map((item, sIdx) => (
                  <div key={sIdx} className="schedule-card">
                    <div className="card-header">
                      <h4 className='chat-req-title'>{item.crewName}</h4>
                      <span className={`chat-req-badge ${item.role === '모임장' ? 'leader' : 'member'}`}>
                        {item.role}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className='chat_req_card_mt'>{item.mountainName}</p>
                      {item.location && <p className='chat_req_card_loc'><strong>위치</strong> {item.location}</p>}
                      <p className='chat_req_card_time'>📅 {new Date(item.crewStartDate).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="chat-time">{msg.time}</div>
          </div>
        ))}

        {/* 로딩 말풍선 */}
        {isLoading && (
          <div className="chat-bubble-wrap bot">
            <div className="chat-bubble loading-bubble">
              <span className="spinner"><img src="/images/icon-gemini.svg" alt="제미나이 아이콘svg" className="input_gem_icon" /> AI가 답변을 작성 중입니다</span>
              <span className="dots">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* 퀵 액션 가이드 버튼 목록 */}
      <div className="chatbot-quick-replies">
        <button 
          type="button" 
          className={`quick-reply-btn gemini ${activeMode === 'GEMINI' ? 'active' : ''}`} 
          onClick={handleGeminiModeClick}
          disabled={isLoading}
        >
          <img src="/images/icon-gemini.svg" alt="제미나이 아이콘svg" /> 제미나이 AI
        </button>
        <button 
          type="button" 
          className={`quick-reply-btn ${activeMode === 'MOUNTAIN' ? 'active' : ''}`} 
          onClick={handleMountainSearchClick}
          disabled={isLoading}
        >
          산 검색
        </button>
        {/* 🌟 로그인 한 사용자(!isGuest)에게만 결제 내역 버튼 표시 */}
          {!isGuest && (
            <button 
              type="button" 
              className={`quick-reply-btn ${activeMode === 'SCHEDULE' ? 'active' : ''}`} 
              onClick={handleScheduleHistoryClick}
              disabled={isLoading}
            >
              나의 일정
            </button>
          )}
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSendMessage} className="chatbot-form">
        <div className="input-field-wrapper">
          {activeMode === 'GEMINI' && (
            <span className="gemini-input-icon">
              <img src="/images/icon-gemini.svg" alt="제미나이 아이콘svg" className="input_gem_icon" />
            </span>
          )}

          <input
            type="text"
            className={`chatbot-input ${activeMode === 'GEMINI' ? 'has-icon' : ''}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isLoading 
                ? "답변을 기다리는 중..." 
                : activeMode === 'SCHEDULE'
                  ? "나의 일정 모드에서는 직접 입력할 수 없습니다."
                  : activeMode === 'GEMINI' 
                    ? '무엇이든 물어보세요!' 
                    : activeMode === 'MOUNTAIN' 
                      ? '산 이름을 입력하세요...' 
                      : '메시지를 입력하세요...'
            }
            /* 🌟 결제 내역 모드일 때 비활성화 처리 */
            disabled={!isConnected || isLoading || activeMode === 'SCHEDULE'}
          />
        </div>

        <button 
          type="submit" 
          className="chatbot-submit-btn" 
          /* 🌟 결제 내역 모드일 때 전송 버튼 비활성화 처리 */
          disabled={!inputValue.trim() || !isConnected || isLoading || activeMode === 'SCHEDULE'}
        >
          {isLoading ? "대기..." : "전송"}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;