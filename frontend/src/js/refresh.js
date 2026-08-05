import axios from 'axios';
import store from '../store/store.jsx'; // 🌟 [추가] 본인의 store 경로에 맞게 수정하세요
import { loginF } from '../store/slice/authSlice.jsx'; // 🌟 [추가] 본인의 authSlice 경로에 맞게 수정하세요

// JWT 토큰에서 만료시간(exp)을 추출하는 헬퍼 함수
const getExpireTimeFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.exp * 1000; // JWT의 exp(초) 단위를 밀리초(ms)로 변환
  } catch (error) {
    console.error("토큰 디코딩 실패:", error);
    return null;
  }
};

// 1. [전역 설정] 기본 베이스 URL 설정
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// 2. [요청 인터셉터] 모든 요청 헤더에 자동으로 Bearer 토큰 주입
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 3. [응답 인터셉터] 
axios.interceptors.response.use(
  (response) => {
    // [Case 1] 슬라이딩 세션: 백엔드가 유효기간 임박 시 던져준 새 토큰 체크
    const newAccessToken = response.headers['authorization-new'];
    
    if (newAccessToken && newAccessToken.startsWith('Bearer ')) {
      const cleanToken = newAccessToken.substring(7);
      localStorage.setItem('accessToken', cleanToken); // 로컬 스토리지 갱신
      
      // 🌟 [추가] 리덕스 Store의 expireTime 실시간 동기화
      const newExpireTime = getExpireTimeFromToken(cleanToken);
      if (newExpireTime) {
        const currentState = store.getState().auth; // 현재 리덕스에 저장된 유저 정보 가져오기
        store.dispatch(loginF({
          isUser: currentState.isUser,
          expireTime: newExpireTime
        }));
        console.log('🔄 [Sliding Session] 백엔드 통신 감지로 리덕스 타이머가 자동 연장되었습니다.');
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // [Case 2] 완전 만료: 30분이 지나 401 에러가 발생했을 때 자동 리프레시
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        const currentUserEmail = localStorage.getItem('userEmail'); 

        if (!currentRefreshToken) throw new Error("리프레시 토큰이 없습니다.");

        const refreshInstance = axios.create(); 
        // const response = await refreshInstance.post(`${import.meta.env.VITE_API_BASE_URL}/api/member/refresh`, {
        const response = await refreshInstance.post(`/api/member/refresh`, {
          refreshToken: currentRefreshToken,
          userEmail: currentUserEmail
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // 🌟 [추가] 401 자동 재발급 성공 시에도 리덕스 타이머 동기화
        const newExpireTime = getExpireTimeFromToken(accessToken);
        if (newExpireTime) {
          const currentState = store.getState().auth;
          store.dispatch(loginF({
            isUser: currentState.isUser,
            expireTime: newExpireTime
          }));
          console.log('🔄 [Auto Refresh] 만료된 세션이 리프레시 토큰으로 자동 복구 및 연장되었습니다.');
        }

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest); 

      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        
        alert("세션이 완전히 만료되었습니다. 다시 로그인해 주세요.");
        window.location.href = '/auth/login'; 
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);