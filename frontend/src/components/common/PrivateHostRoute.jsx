import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../js/jwtUtils';

const PrivateHostRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const payload = decodeToken(token);
  const userRole = payload?.role || payload?.userRole || payload?.auth;
  
  // HOST 권한 검증 (관리자 권한도 허용하고 싶다면 isAdmin 조건 추가)
  const isHost = userRole === 'HOST' || userRole === 'ROLE_HOST' || userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);

    if (!payload || (payload.exp && payload.exp < now)) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/auth/login', { replace: true });
      return;
    }

    if (!isHost) {
      alert('접근 권한이 없습니다. (호스트 전용)');
        navigate('/subscribe/plan', { replace: true });
    }
    
  }, [payload, isHost, navigate]);

  const now = Math.floor(Date.now() / 1000);
  const isAuthorized = payload && (!payload.exp || payload.exp >= now) && isHost;

  return isAuthorized ? children : null;
};

export default PrivateHostRoute;