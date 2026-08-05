import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 7개의 기본 이미지 파일명 정의
const DEFAULT_IMAGES = [
  'profile_default_1.png', 'profile_default_2.png', 'profile_default_3.png', 'profile_default_4.png',
  'profile_default_5.png', 'profile_default_6.png', 'profile_default_7.png'
];

const Join = () => {
  // 현재 서 있는 단계 상태 (1: 인적사항, 2: 프로필 및 추가정보)
  const [step, setStep] = useState(1);

  // 1. 기존 폼 데이터 상태 유지
  const [formData, setFormData] = useState({
    userEmail: '',
    userPw: '',
    userName: '',
    phone: '',
    address: '',
    memberDetail: '', 
    gender: '',      
    hikingLevel: 1,   
    messageAgree: true, 
  });

  // 프로필 사진 관리를 위한 독립 상태
  const [profileType, setProfileType] = useState('default'); 
  const [defaultImageName, setDefaultImageName] = useState('profile_default_1.png'); 
  const [customFile, setCustomFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState('/images/profile_default_1.png'); 

  // 이메일 중복 확인 완료 여부 상태
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const navigate = useNavigate();

  // 일반 입력창 변경 핸들러
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

    if (name === 'userEmail') {
      setIsEmailChecked(false);
    }
  };

  // 기본 프로필 이미지 클릭 시 핸들러
  const handleDefaultSelect = (imgName) => {
    setProfileType('default');
    setDefaultImageName(imgName);
    setCustomFile(null);
    setPreviewUrl(`/images/${imgName}`); 
  };

  // 파일 업로드 변경 시 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileType('custom');
      setCustomFile(file);
      setDefaultImageName('');
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 이메일 중복 확인 로직
  const handleCheckEmail = async () => {
    if (!formData.userEmail) {
      alert('이메일을 입력해 주세요.');
      return;
    }

    try {
      // const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/member/checkEmail`, {
      const response = await axios.post(`/api/member/checkEmail`, {
        userEmail: formData.userEmail
      });

      if (response.data.isAvailable) {
        alert('사용 가능한 이메일입니다.');
        setIsEmailChecked(true);
      } else {
        alert('이미 가입된 이메일입니다.');
      }
    } catch (error) {
      console.error('이메일 중복 확인 에러:', error);
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  // 🌟 다음 단계 이동 전 예외처리 및 유효성 검사
  const handleNextStep = () => {
    const { userEmail, userPw, userName, phone, gender, address } = formData;

    if (!userEmail || !userPw || !userName || !phone || !gender || !address) {
      alert('모든 필수 항목을 입력해 주세요.');
      return;
    }

    if (!isEmailChecked) {
      alert('이메일 중복 확인을 먼저 완료해 주세요.');
      return;
    }

    if (userPw.length < 4) {
      alert('비밀번호는 4자 이상으로 설정해 주세요.');
      return;
    }

    // 4. 🌟 성별 선택 여부 예외처리 검사
    if (!gender) {
      alert('성별을 선택해 주세요.');
      return;
    }

    // 모든 조건 충족 시 2단계로 이동
    setStep(2);
  };

  // 이전 단계로 돌아가기
  const handlePrevStep = () => {
    setStep(1);
  };

  // 폼 최종 제출 (2단계에서 실행)
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (step === 1) {
      handleNextStep(); // 다음 단계 검사 및 이동 로직 수행
      return;           // 백엔드로 전송되지 않도록 여기서 중단시킴
    }

    const uploadData = new FormData();
    
    Object.keys(formData).forEach((key) => {
      uploadData.append(key, formData[key]);
    });

    if (profileType === 'default') {
      uploadData.append('defaultImageName', defaultImageName);
    } else if (profileType === 'custom' && customFile) {
      uploadData.append('profileFile', customFile);
    }

    try {
      const response = await axios.post(`/api/member/signup`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert('회원가입이 완료되었습니다! 로그인해 주세요.');
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      if (error.response && error.response.data) {
        alert(`회원가입 실패: ${error.response.data.message || '입력값을 확인해주세요.'}`);
      } else {
        alert('서버와의 통신이 원활하지 않습니다.');
      }
    }
  };

  return (
    <div className='join_wrap'>
      {/* 컴포넌트 상단에 현재 단계를 시각적으로 보여주는 인디케이터가 있으면 좋습니다 */}
      <div className="join_progress">
        <span className={step === 1 ? 'active' : ''}>1. 정보 입력</span>
        <span className="arrow">➔</span>
        <span className={step === 2 ? 'active' : ''}>2. 프로필 설정</span>
      </div>

      <form onSubmit={handleSubmit} className='join_form'>
        <h2 className='join_title'>🏔️ 크루 회원가입</h2>
        
        {/* 애니메이션 효과를 부드럽게 감싸줄 컨테이너 트랙 */}
        <div className="join_steps_container">
          <div className={`join_steps_track step_${step}`}>
            
            {/* [1단계 섹션] */}
            <div className={`join_step_wrap ${step === 1 ? 'fade_in' : 'fade_out'}`}>
              {/* 이메일 입력 */}
              <div className='join_con'>
                <label className='join_label'>이메일</label>
                <div className='join_email_wrap'>
                  <input 
                    type="email" 
                    name="userEmail" 
                    value={formData.userEmail} 
                    onChange={handleChange} 
                    placeholder="example@hiking.com"
                    required={step === 1} 
                    className='join_input'
                  />
                  <button 
                    type="button" 
                    onClick={handleCheckEmail}
                    className='join_check_btn'
                  >
                    중복확인
                  </button>
                </div>
                {isEmailChecked && (
                  <small className='join_auth_check'>✓ 사용 가능한 이메일입니다.</small>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className='join_con'>
                <label className='join_label'>비밀번호 (4자 이상)</label>
                <input 
                  type="password" 
                  name="userPw" 
                  value={formData.userPw} 
                  onChange={handleChange} 
                  placeholder="비밀번호를 입력하세요"
                  required={step === 1} 
                  className='join_input'
                />
              </div>

              {/* 이름 입력 */}
              <div className='join_con'>
                <label className='join_label'>이름</label>
                <input 
                  type="text" 
                  name="userName" 
                  value={formData.userName} 
                  onChange={handleChange} 
                  placeholder="홍길동"
                  required={step === 1} 
                  className='join_input'
                />
              </div>

              {/* 전화번호 입력 */}
              <div className='join_con'>
                <label className='join_label'>전화번호</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="010-XXXX-XXXX" 
                  required={step === 1} 
                  className='join_input'
                />
              </div>

              {/* 성별 라디오 버튼 */}
              <div className='join_con'>
                <label className='join_label'>성별</label>
                <div className='join_radio_group'>
                  <label className='join_radio_label'>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="남성" 
                      checked={formData.gender === '남성'} 
                      onChange={handleChange} 
                      required={step === 1}
                    />
                    <span>남성</span>
                  </label>
                  <label className='join_radio_label'>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="여성" 
                      checked={formData.gender === '여성'} 
                      onChange={handleChange} 
                      required={step === 1}
                    />
                    <span>여성</span>
                  </label>
                </div>
              </div>

              {/* 주소 입력 */}
              <div className='join_con'>
                <label className='join_label'>주소</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="기본 주소를 입력하세요"
                  required={step === 1} 
                  className='join_input'
                />
              </div>

              {/* 정보수신동의 라디오 버튼 */}
              <div className='join_con'>
                <label className='join_label'>정보수신동의</label>
                <div className='join_radio_group'>
                  <label className='join_radio_label'>
                    <input 
                      type="radio" 
                      name="messageAgree" 
                      value="true" 
                      checked={formData.messageAgree === true} 
                      onChange={handleChange} 
                      required={step === 2}
                    />
                    <span>동의함</span>
                  </label>
                  <label className='join_radio_label'>
                    <input 
                      type="radio" 
                      name="messageAgree" 
                      value="false" 
                      checked={formData.messageAgree === false} 
                      onChange={handleChange} 
                      required={step === 2}
                    />
                    <span>동의안함</span>
                  </label>
                </div>
              </div>

              {/* 🌟 다음 버튼 클릭 시 유효성 검사 작동 */}
              <button type="button" className='join_submit_btn' onClick={handleNextStep}>
                다음 단계로 ➔
              </button>
            </div>

            
            {/* [2단계 섹션] */}
            <div className={`join_step_wrap ${step === 2 ? 'fade_in' : 'fade_out'}`}>
              {/* 프로필 이미지 선택 섹션 */}
              <div className='join_con'>
                <label className='join_label'>프로필 이미지 설정</label>
                <div className='profile_flex_container'>
                  
                  {/* 좌측: 미리보기 화면 */}
                  <div className='profile_preview_zone'>
                    <div className='preview_img_holder'>
                      <img src={previewUrl} alt="MEMBER_AVATAR" />
                    </div>
                  </div>

                  {/* 우측: 4x2 그리드 선택존 */}
                  <div className='profile_grid_zone'>
                    {DEFAULT_IMAGES.map((imgName, index) => {
                      const isSelected = profileType === 'default' && defaultImageName === imgName;
                      return (
                        <div 
                          key={index}
                          className={`grid_avatar_circle ${isSelected ? 'active_avatar' : ''}`}
                          onClick={() => handleDefaultSelect(imgName)}
                          style={{ backgroundImage: `url(/images/${imgName})` }}
                          title={`기본 프로필 ${index + 1}`}
                        >
                          {isSelected && <div className='avatar_badge'>✓</div>}
                        </div>
                      );
                    })}

                    {/* 8번째 칸: 파일 직접 업로드 단추 */}
                    <label className={`grid_avatar_circle file_upload_box ${profileType === 'custom' ? 'active_avatar' : ''}`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                      <span className='plus_icon'>+</span>
                      <span className='upload_txt'>업로드</span>
                    </label>
                  </div>

                </div>
              </div>

              {/* 자기소개 입력 */}
              <div className='join_con'>
                <label className='join_label'>자기소개 (선택)</label>
                <input 
                  type="text" 
                  name="memberDetail" 
                  value={formData.memberDetail} 
                  onChange={handleChange} 
                  placeholder="자기소개를 입력하세요"
                  className='join_input'
                />
              </div>

              {/* 등산 레벨 라디오 버튼 */}
              <div className='join_con'>
                <label className='join_label'>등산 레벨</label>
                <div className='join_radio_group level_group'>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <label key={level} className='join_radio_label'>
                      <input 
                        type="radio" 
                        name="hikingLevel" 
                        value={level} 
                        checked={formData.hikingLevel === level} 
                        onChange={handleChange} 
                      />
                      <span>Lv.{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              

              {/* 하단 버튼 배치 (이전 / 가입하기 하이브리드 구성) */}
              <div className="join_btn_group">
                <button type="button" className='join_prev_btn' onClick={handlePrevStep}>
                  이전으로
                </button>
                <button type="submit" className='join_submit_btn'>
                  가입하기 완료 🏔️
                </button>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default Join;