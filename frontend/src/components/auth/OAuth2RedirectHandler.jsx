import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginF } from '../../store/slice/authSlice'; 
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  useEffect(() => {
    const handleOAuth2Login = async () => {
      // 1. 백엔드가 리다이렉트 URL 파라미터로 넘겨준 데이터 추출
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userName = searchParams.get('userName');
      const role = searchParams.get('role');
      const userEmail = searchParams.get('userEmail');
      const accessTokenExpirationTime = searchParams.get('accessTokenExpirationTime');

      // 2. 토큰 존재 여부 검증
      if (accessToken && refreshToken) {
        try {
          // 3. 브라우저 로컬 스토리지(LocalStorage)에 인증 정보 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('accessTokenExpirationTime', accessTokenExpirationTime);
          localStorage.setItem('userName', userName || '');
          localStorage.setItem('userRole', role || '');
          localStorage.setItem('userEmail', userEmail || '');

          const calculatedExpireTime = new Date().getTime() + Number(accessTokenExpirationTime || 1800000);

          // ⭐ 리덕스 스토어 상태 업데이트 실행
          dispatch(loginF({
            isUser: {
              role: role,
              userName: userName,
              userEmail: userEmail || '' // 🚨 formData.userEmail 버그 수정
            },
            expireTime: calculatedExpireTime
          }));

          // ⭐ 로그인 성공 직후 다음 axios 요청부터 토큰이 자동 첨부되도록 글로벌 세팅
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // ======================== 장바구니 Merge 로직 ========================
          const guestId = localStorage.getItem("guestId");
          if (guestId) {
            try {
              // axios.post 앞에 await 추가
              const res = await axios.post(`/cart/merge/${guestId}`);
              console.log('[장바구니 병합 성공]', res.data);
              if (res.data?.message) {
                alert(res.data.message);
              }
              localStorage.removeItem("guestId");
            } catch (error) {
              console.error('장바구니 merge 실패:', error);
            }
          }
          // ====================================================================

          alert(`${userName || '사용자'}님, 환영합니다!`);
          console.log('[소셜 로그인 성공] 토큰 및 회원 정보 저장 완료', { userName, userEmail });

          // 4. 메인 페이지로 이동
          navigate('/', { replace: true });
          
        } catch (error) {
          console.error('인증 정보 저장 중 오류 발생:', error);
          alert('로그인 처리 중 에러가 발생했습니다.');
          navigate('/auth/login', { replace: true });
        }
      } else {
        alert('유효하지 않은 로그인 요청입니다. 다시 시도해 주세요.');
        navigate('/auth/login', { replace: true });
      }
    };

    handleOAuth2Login();
  }, [searchParams, navigate, dispatch]);

  return (
    <div style={styles.container}>
      <div style={styles.spinnerBox}>
        <div style={styles.spinner}></div>
        <h2 style={styles.title}>소셜 로그인 처리 중</h2>
        <p style={styles.subtitle}>안전하게 로그인 세션을 생성하고 있습니다. 잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justify: 'center',
    alignItems: 'center',
    height: '80vh',
    backgroundColor: '#f9fafb',
  },
  spinnerBox: {
    textAlign: 'center',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3b82f6',
    borderRadius: '50%',
    margin: '0 auto 1.5rem auto',
    animation: 'spin 1s linear infinite',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#6b7280',
  }
};

if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0] || document.head.appendChild(document.createElement('style')).sheet;
  try {
    styleSheet.insertRule('@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }', styleSheet.cssRules.length);
  } catch (e) {}
}