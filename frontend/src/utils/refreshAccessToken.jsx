import axios from "axios";
import { loginF } from "../store/slice/authSlice";

// yein 작성 -> hyun님이 작성한 Header.jsx - handleRefresh(시간 연장 처리 함수) 공통 함수화

export const refreshAccessToken = async (dispatch) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const userEmail = localStorage.getItem("userEmail") || isUser?.userEmail;

    if (!refreshToken) {
      throw new Error("Refresh Token이 없습니다.");
    }

    console.log("[Refresh] 토큰 연장 요청 시작...", { userEmail, refreshToken });

    // 백엔드 /api/member/refresh 호출
    const response = await axios.post(`/api/member/refresh`, {
      refreshToken: refreshToken,
      userEmail: userEmail
    });

    if (response.status === 200) {
      const { accessToken, refreshToken: newRefreshToken, accessTokenExpirationTime, userName, role } = response.data;

      // 1. 로컬스토리지 토큰 갱신
      localStorage.setItem("accessToken", accessToken);
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

      // 2. Axios 공통 헤더 교체
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // 3. ⭐ 리덕스 authSlice 스펙과 정확히 일치하도록 페이로드 가공하여 디스패치
      const newExpireTime = new Date().getTime() + Number(accessTokenExpirationTime);

      console.log("[Refresh] 연장 성공! 새 만료 시간 밀리초:", newExpireTime);

      dispatch(loginF({
        isUser: {
          userEmail: userEmail || isUser?.userEmail,
          userName: userName || isUser?.userName,
          role: role || isUser?.role
        },
        expireTime: newExpireTime
      }));

      return accessToken;
    }
  } catch (error) {
    throw error;
  }
}