import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginF } from '../../store/slice/authSlice';

const DEFAULT_IMAGES = [
  'profile_default_1.png', 'profile_default_2.png', 'profile_default_3.png', 'profile_default_4.png',
  'profile_default_5.png', 'profile_default_6.png', 'profile_default_7.png'
];

const Auth2Join = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // 현재 단계 상태 (1: 인적사항 입력, 2: 프로필 및 추가정보)
  const [step, setStep] = useState(1);
  const [ticket, setTicket] = useState('');

  // 🌟 소셜 정보와 추가 정보를 하나의 통합 formData로 관리
  const [formData, setFormData] = useState({
    userEmail: '',
    userPw: '',        // 소셜 회원도 직접 입력할 비밀번호 필드
    userName: '',
    phone: '',
    gender: '',
    address: '',       // 주소 입력 필드
    provider: '',      // 소셜 제공처 (google, kakao 등)
    memberDetail: '', 
    hikingLevel: 1,   
    messageAgree: true, 
  });

  const [profileType, setProfileType] = useState('default'); 
  const [defaultImageName, setDefaultImageName] = useState('profile_default_1.png'); 
  const [customFile, setCustomFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState('/images/profile_default_1.png'); 

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketParam = params.get('ticket');
    const errorParam = params.get('error');


    if (!ticketParam) {
      alert("비정상적인 접근이거나 만료된 요청입니다.");
      navigate('/auth/login');
      return;
    }

    setTicket(ticketParam);

    // 티켓을 사용하여 소셜 임시 정보 가져오기
    axios.get(`/api/member/oauth2/temp-info?ticket=${ticketParam}`)
      .then(response => {
        const data = response.data;
        setFormData(prev => ({
          ...prev,
          userEmail: data.userEmail,
          userName: data.userName || '',
          phone: data.phone || '',
          gender: data.gender || '',
          provider: data.provider || ''
        }));
      })
      .catch(error => {
        console.error("소셜 정보 로드 실패:", error);
        alert("인증 정보가 만료되었거나 올바르지 않습니다.");
        navigate('/auth/login');
      });
  }, [location, navigate]);

  // 입력창 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'hikingLevel' 
        ? parseInt(value, 10) 
        : name === 'messageAgree' 
          ? value === 'true' 
          : value,
    });
  };

  // 1단계 유효성 검사
  const handleNextStep = () => {
    const { userEmail, userPw, userName, phone, gender, address } = formData;

    if (!userEmail || !userPw || !userName || !phone || !gender || !address) {
      alert('모든 필수 항목을 입력해 주세요.');
      return;
    }

    if (userPw.length < 4) {
      alert('비밀번호는 4자 이상으로 설정해 주세요.');
      return;
    }

    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleDefaultSelect = (imgName) => {
    setProfileType('default');
    setDefaultImageName(imgName);
    setCustomFile(null);
    setPreviewUrl(`/images/${imgName}`); 
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileType('custom');
      setCustomFile(file);
      setDefaultImageName('');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 최종 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    const uploadData = new FormData();
    uploadData.append('ticket', ticket);
    // 🌟 백엔드에서 분기문 기준으로 사용하는 profileType 값을 전송 목록에 추가합니다.
    uploadData.append('profileType', profileType);

    // 가공된 모든 통합 폼 데이터 전송
    Object.keys(formData).forEach((key) => {
      uploadData.append(key, formData[key]);
    });

    if (profileType === 'default') {
      uploadData.append('defaultImageName', defaultImageName);
    } else if (profileType === 'custom' && customFile) {
      uploadData.append('profileFile', customFile);
    }

    try {
      const response = await axios.post(`/api/member/oauth2/signup`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200 || response.status === 201) {
        alert('반갑습니다! 소셜 회원가입 및 프로필 설정이 완료되었습니다.');

        const { accessToken, refreshToken, userName, role, userEmail, accessTokenExpirationTime} = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', userEmail);

        const calculatedExpireTime = new Date().getTime() + Number(accessTokenExpirationTime);

        // ⭐ 리덕스 스토어 상태 업데이트 실행!
        dispatch(loginF({
          isUser: {
            role: role,
            userName: userName,
            userEmail: userEmail || formData.userEmail
          },
          expireTime: calculatedExpireTime // 💡 정확한 만료 시각(Timestamp) 주입
        }));

        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // ======================== yein  ========================
      // 로그인 전에 비회원 상태로 담은 장바구니(Redis) 있으면 회원 CartDB와 merge
      const guestId = localStorage.getItem("guestId");
      if (guestId) {
        try {
          const res = await axios.post(`/cart/merge/${guestId}`);
          console.log(res.data);
          alert(res.data.message);
          // merge 후 Redis 장바구니 삭제
          localStorage.removeItem("guestId");
        } catch (error) {
          console.error(error);
          alert("장바구니 merge 실패");
        }
      }

      
      navigate('/');
      
      // ======================== yein  ========================

      }
    } catch (error) {
      console.error('소셜 회원가입 에러:', error);
      alert('회원가입 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='join_wrap'>
      {/* 단계 인디케이터 */}
      <div className="join_progress">
        <span className={step === 1 ? 'active' : 'disabled'}>1. 필수 정보 입력</span>
        <span className="arrow">➔</span>
        <span className={step === 2 ? 'active' : 'disabled'}>2. 프로필 및 추가 정보</span>
      </div>

      <form onSubmit={handleSubmit} className='join_form'>
        <h2 className='join_title'>🏔️ 소셜 가입 추가정보 입력</h2>
        <p className="social_welcome_msg">
          <strong>{formData.userEmail}</strong> 계정 인증 성공 ({formData.provider} 연동)
        </p>
        
        <div className="join_steps_container">
          <div className={`join_steps_track step_${step}`}>
            
            {/* [1단계: 소셜 연동 및 필수 개인정보] */}
            <div className={`join_step_wrap ${step === 1 ? 'fade_in' : 'fade_out'}`}>
              
              <div className='join_con'>
                <label className='join_label'>이메일 주소</label>
                <input type="email" name="userEmail" value={formData.userEmail} readOnly className='join_input readonly_input' />
              </div>

              <div className='join_con'>
                <label className='join_label'>소셜 제공처</label>
                <input type="text" name="provider" value={formData.provider} readOnly className='join_input readonly_input' />
              </div>

              <div className='join_con'>
                <label className='join_label'>소셜 계정 비밀번호 설정 (4자 이상)</label>
                <input 
                  type="password" 
                  name="userPw" 
                  value={formData.userPw} 
                  onChange={handleChange} 
                  placeholder="앞으로 사용할 소셜 로그인 전용 암호 입력" 
                  required={step === 1}
                  className='join_input' 
                />
              </div>

              <div className='join_con'>
                <label className='join_label'>이름</label>
                <input 
                  type="text" 
                  name="userName" 
                  value={formData.userName} 
                  onChange={handleChange}
                  readOnly={!!formData.userName} 
                  className={`join_input ${formData.userName ? 'readonly_input' : ''}`} 
                />
              </div>

              <div className='join_con'>
                <label className='join_label'>전화번호</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="010-XXXX-XXXX"
                  className='join_input' 
                />
              </div>

              <div className='join_con'>
                <label className='join_label'>성별</label>
                <div className='join_radio_group'>
                  <label className='join_radio_label'>
                    <input type="radio" name="gender" value="남성" checked={formData.gender === '남성'} onChange={handleChange} />
                    <span>남성</span>
                  </label>
                  <label className='join_radio_label'>
                    <input type="radio" name="gender" value="여성" checked={formData.gender === '여성'} onChange={handleChange} />
                    <span>여성</span>
                  </label>
                </div>
              </div>

              <div className='join_con'>
                <label className='join_label'>주소</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="주소를 입력하세요" 
                  required={step === 1}
                  className='join_input' 
                />
              </div>

              <button type="button" className='join_submit_btn' onClick={handleNextStep}>
                다음 단계로 (프로필 설정) ➔
              </button>
            </div>

            {/* [2단계: 프로필 이미지 및 서비스 정보] */}
            <div className={`join_step_wrap ${step === 2 ? 'fade_in' : 'fade_out'}`}>
              <div className='join_con'>
                <label className='join_label'>프로필 이미지 설정</label>
                <div className='profile_flex_container'>
                  <div className='profile_preview_zone'>
                    <div className='preview_img_holder'>
                      <img src={previewUrl} alt="MEMBER_AVATAR" />
                    </div>
                  </div>

                  <div className='profile_grid_zone'>
                    {DEFAULT_IMAGES.map((imgName, index) => {
                      const isSelected = profileType === 'default' && defaultImageName === imgName;
                      return (
                        <div 
                          key={index}
                          className={`grid_avatar_circle ${isSelected ? 'active_avatar' : ''}`}
                          onClick={() => handleDefaultSelect(imgName)}
                          style={{ backgroundImage: `url(/images/${imgName})` }}
                        >
                          {isSelected && <div className='avatar_badge'>✓</div>}
                        </div>
                      );
                    })}

                    <label className={`grid_avatar_circle file_upload_box ${profileType === 'custom' ? 'active_avatar' : ''}`}>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      <span className='plus_icon'>+</span>
                      <span className='upload_txt'>업로드</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className='join_con'>
                <label className='join_label'>자기소개 (선택)</label>
                {/* 🌟 꼬여있던 이벤트 핸들러 대상을 온전한 handleChange로 수정 완료 */}
                <input 
                  type="text" 
                  name="memberDetail" 
                  value={formData.memberDetail} 
                  onChange={handleChange} 
                  placeholder="자기소개를 입력하세요" 
                  className='join_input' 
                />
              </div>

              <div className='join_con'>
                <label className='join_label'>등산 레벨</label>
                <div className='join_radio_group level_group'>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <label key={level} className='join_radio_label'>
                      <input type="radio" name="hikingLevel" value={level} checked={formData.hikingLevel === level} onChange={handleChange} />
                      <span>Lv.{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='join_con'>
                <label className='join_label'>정보수신동의</label>
                <div className='join_radio_group'>
                  <label className='join_radio_label'>
                    <input type="radio" name="messageAgree" value="true" checked={formData.messageAgree === true} onChange={handleChange} />
                    <span>동의함</span>
                  </label>
                  <label className='join_radio_label'>
                    <input type="radio" name="messageAgree" value="false" checked={formData.messageAgree === false} onChange={handleChange} />
                    <span>동의안함</span>
                  </label>
                </div>
              </div>

              <div className="join_btn_group">
                <button type="button" className='join_prev_btn' onClick={handlePrevStep}>이전으로</button>
                <button type="submit" className='join_submit_btn'>가입 및 자동 로그인 완료 🏔️</button>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default Auth2Join;