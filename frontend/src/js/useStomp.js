import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 웹소켓 연결 및 실시간 알림을 수신하는 커스텀 훅
export const useStomp = () => {
  // 방금 수신된 실시간 알림 데이터 상태 관리
  const [realtimeNotice, setRealtimeNotice] = useState(null);

  useEffect(() => {
    // 로컬스토리지에서 토큰과 로그인한 이메일 추출
    const token = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');

    // 토큰이나 이메일이 없으면 연결 시도 안 함
    if (!token || !userEmail) return;

    // 백엔드와 동일하게 이메일 특수문자(@, .) 치환
    const safeEmail = userEmail.replace(/[@.]/g, '_');

    // STOMP 클라이언트 생성 및 기본 설정
    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`/back/ws-stomp`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 웹소켓 연결 성공 시 실행되는 콜백
    stompClient.onConnect = () => {
      // console.log('STOMP 연결 성공!');
      
      // API 호출 과정 없이, 치환된 이메일로 바로 큐(Queue) 구독
      stompClient.subscribe(`/queue/notifications.${safeEmail}`, (message) => {
        if (message.body) {
          // 수신된 메시지를 JSON으로 변환하여 상태 업데이트
          setRealtimeNotice(JSON.parse(message.body));
        }
      });
    };

    // STOMP 클라이언트 활성화(연결 시도)
    stompClient.activate();

    // 컴포넌트 언마운트 시 웹소켓 연결 안전하게 해제
    return () => {
      stompClient.deactivate();
    };
  }, []);

  return { realtimeNotice };
};