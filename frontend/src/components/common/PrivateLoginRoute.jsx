import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../js/jwtUtils';

const PrivateLoginRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const payload = decodeToken(token);
    const now = Math.floor(Date.now() / 1000);

    // 토큰이 없거나 만료된 경우
    if (!payload || (payload.exp && payload.exp < now)) {
      alert('로그인이 필요한 서비스입니다.');
      
        navigate('/auth/login', { replace: true }); 
    }
  }, [token, navigate]);

  const payload = decodeToken(token);
  const now = Math.floor(Date.now() / 1000);
  const isAuthenticated = payload && (!payload.exp || payload.exp >= now);

  return isAuthenticated ? children : null;
};

export default PrivateLoginRoute;