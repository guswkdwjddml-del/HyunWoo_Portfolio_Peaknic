// JWT 토큰을 디코딩하여 Payload 객체를 반환하는 함수
export const decodeToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1]; // Payload 부분 추출
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT 토큰 디코딩 실패:', error);
      return null;
    }
  };