import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../js/jwtUtils';

const PrivateAdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  // 백엔드 JWT 설정에 맞게 권한 키값 및 문자열을 체크하세요. (예: payload.role === 'ADMIN' 또는 'ROLE_ADMIN')
  const payload = decodeToken(token);
  const userRole = payload?.role || payload?.userRole || payload?.auth;
  const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);

    if (!payload || (payload.exp && payload.exp < now)) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/auth/login', { replace: true });
      return;
    }

    if (!isAdmin) {
      alert('접근 권한이 없습니다. (관리자 전용)');
        navigate(-1, { replace: true });
    }
  }, [payload, isAdmin, navigate]);

  const now = Math.floor(Date.now() / 1000);
  const isAuthorized = payload && (!payload.exp || payload.exp >= now) && isAdmin;

  return isAuthorized ? children : null;
};

export default PrivateAdminRoute;