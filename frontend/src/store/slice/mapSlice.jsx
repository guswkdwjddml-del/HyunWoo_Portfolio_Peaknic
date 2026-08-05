import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastCenter: { lat: 37.5665, lng: 126.9780 }, // 기본 중심 (서울)
  lastZoomLevel: 5,
};

// 산 상세내역에서 경로코스를 확인후 크루만들기할때, 위치 그대로 가져오기
const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // 지도를 움직일 때마다 현재 위치를 스토어에 저장
    saveMapState: (state, action) => {
      state.lastCenter = action.payload.center;
      state.lastZoomLevel = action.payload.zoomLevel;
    },
  },
});

export const { saveMapState } = mapSlice.actions;
export default mapSlice.reducer;