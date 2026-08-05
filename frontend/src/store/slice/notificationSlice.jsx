import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    unreadCount: 0,
    headerNotis: [], // 헤더 드롭다운용 안 읽은 알림 목록
  },
  reducers: {
    // 1. 초기 데이터 세팅 (백엔드 버그 방지용 read -> isRead 정규화 포함)
    setInitNoticeData: (state, action) => {
      state.unreadCount = action.payload.count;
      state.headerNotis = action.payload.notis.map(n => ({
        ...n,
        isRead: n.read !== undefined ? n.read : n.isRead // 백엔드 이름 변환 버그 방어!
      }));
    },
    // 2. 웹소켓 실시간 수신 시 헤더에 추가
    addRealtimeNotice: (state, action) => {
      const newNoti = { ...action.payload, isRead: action.payload.read ?? action.payload.isRead };
      const exists = state.headerNotis.some(n => n.id === newNoti.id);
      if (!exists) {
        state.headerNotis.unshift(newNoti);
        if (state.headerNotis.length > 10) state.headerNotis.pop(); // 최대 10개만 유지
        state.unreadCount += 1;
      }
    },
    // 3. 단건 읽음 처리 (헤더에서 즉시 삭제 및 카운트 감소)
    readNoticeGlobal: (state, action) => {
      const id = action.payload;
      state.headerNotis = state.headerNotis.filter(n => n.id !== id);
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    // 4. 전체 읽음 처리
    readAllNoticesGlobal: (state) => {
      state.unreadCount = 0;
      state.headerNotis = [];
    }
  }
});

export const { setInitNoticeData, addRealtimeNotice, readNoticeGlobal, readAllNoticesGlobal } = notificationSlice.actions;
export default notificationSlice.reducer;