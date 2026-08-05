import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginF } from '../../store/slice/authSlice';
import { cartListPrint, cartMerge } from '../../store/slice/cartSlice';
import { API_BACK_SERVER_URL, showApiError } from '../../utils/commonModule';

const Login = () => {
  // 1. 로그인 폼 상태 관리
  const [formData, setFormData] = useState({
    userEmail: '',
    userPw: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
  
    if (error === "local_user_exists") {
      alert("이미 일반 회원가입으로 가입된 이메일입니다. 일반 로그인을 이용해 주세요.");
      navigate('/auth/login', { replace: true });
    } else if (error !== null) {
      // 💡 소셜 로그인 실패(일반 error 파라미터) 처리 추가
      alert("소셜 로그인에 실패했거나 취소되었습니다. 다시 시도해 주세요.");
      navigate('/auth/login', { replace: true });
    }
  }, [location, navigate]);

  // 2. 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 3. 🔑 로그인 제출 로직
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 백엔드 로그인 API 호출
      const response = await axios.post(`/api/member/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 로그인 성공 시 백엔드가 준 LoginDto 구조 분할 할당
      const { accessToken, refreshToken, userName, role, userEmail, accessTokenExpirationTime} = response.data;

      // 중요: 토큰 및 보안 정보를 로컬 스토리지에 안착
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userRole', role);
      // 추가로 시간 연장을 위해 이메일도 저장해둡니다.
      localStorage.setItem('userEmail', userEmail || formData.userEmail);

      // ⭐ [핵심 수정] expireTime 타임스탬프 계산 정확화
      // 백엔드가 준 만료 수명(밀리초 단위, 예: 1800000)을 현재 타임스탬프에 더해 만료 시각으로 변환합니다.
      const calculatedExpireTime = new Date().getTime() + Number(accessTokenExpirationTime);

      console.log("[Login 성공] 백엔드 만료시간(수명):", accessTokenExpirationTime);
      console.log("[Login 성공] 계산된 프론트엔드 만료시각:", calculatedExpireTime);

      // ⭐ 리덕스 스토어 상태 업데이트 실행!
      dispatch(loginF({
        isUser: {
          role: role,
          userName: userName,
          userEmail: userEmail || formData.userEmail
        },
        expireTime: calculatedExpireTime // 💡 정확한 만료 시각(Timestamp) 주입
      }));

      // ⭐ 로그인 성공 직후 다음 axios 요청부터 토큰이 자동 첨부되도록 글로벌 세팅
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      alert(`${userName}님, 환영합니다!`);


      // ======================== yein  ========================
      // 로그인 전에 비회원 상태로 담은 장바구니(Redis) 있으면 회원 CartDB와 merge
      const guestId = localStorage.getItem("guestId");
      if (guestId) {
        try {
          const res = await dispatch(cartMerge({ guestId })).unwrap();
          alert(res);

          // merge 후 Redis 장바구니 삭제
          localStorage.removeItem("guestId");

          // merge 후 장바구니 다시 조회
          await dispatch(cartListPrint({ accessToken })).unwrap();
        } catch (error) {
          showApiError(error);
        }
      }

      navigate('/');

      // ======================== yein  ========================


    } catch (error) {
      console.error('로그인 에러:', error);
      if (error.response && error.response.data) {
        alert(`로그인 실패: ${error.response.data.message || '이메일 또는 비밀번호를 확인하세요.'}`);
      } else {
        alert('서버와 연결할 수 없습니다.');
      }
    }
  };

  const handleSocialLogin = (provider) => {
    // 백엔드 주소가 localhost:8088이므로 해당 시큐리티 주소로 브라우저 이동
    window.location.href = `/back/oauth2/authorization/${provider}`;
  };

  const handleSocialLogin2 = (provider) => {
    // 백엔드 주소가 localhost:8088이므로 해당 시큐리티 주소로 브라우저 이동
    window.location.href = `http://ec2-54-116-208-12.ap-northeast-2.compute.amazonaws.com/back/oauth2/authorization/${provider}`;
  };


  return (
    <div className='login_wrap'>
      <form onSubmit={handleSubmit} className='login_form'>
        <h2 className='login_title'>로그인</h2>

        {/* 이메일 입력 구역 */}
        <div className='login_con'>
          <label>이메일</label>
          <div className='login_email_wrap'>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="example@hiking.com"
              required
            />
          </div>
        </div>

        {/* 비밀번호 입력 구역 */}
        <div className='login_con'>
          <label>비밀번호</label>
          <input
            type="password"
            name="userPw"
            value={formData.userPw}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        {/* 로그인 제출 버튼 */}
        <div className="login_submit_wrap">

          <button type="submit" className='login_submit_btn'>로그인</button>
          {/* <Link to={`/auth/join`} className="login_submit_btn join_go_btn">회원가입</Link> */}
        </div>

        <div className="social_btn_group">
          <strong className="social_login_title">간편 로그인</strong>
          <div className="social_btn_box">

            <button
              type="button"
              className="social_btn naver_btn"
              onClick={() => handleSocialLogin('naver')}
            >
              로그인
            </button>
            <button
              type="button"
              className="social_btn google_btn"
              onClick={() => handleSocialLogin2('google')}
            >
              로그인
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Login;