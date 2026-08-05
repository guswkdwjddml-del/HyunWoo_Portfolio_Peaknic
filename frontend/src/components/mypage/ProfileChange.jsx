import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginF } from '../../store/slice/authSlice'; 
import axios from 'axios';

const DEFAULT_IMAGES = [
  'profile_default_1.png', 'profile_default_2.png', 'profile_default_3.png', 'profile_default_4.png',
  'profile_default_5.png', 'profile_default_6.png', 'profile_default_7.png'
];

const ProfileChange = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    memberDetail: '',  
    hikingLevel: 1,
  });

  const [profileType, setProfileType] = useState('default'); 
  const [defaultImageName, setDefaultImageName] = useState('profile_default_1.png'); 
  const [customFile, setCustomFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState('/images/profile_default_1.png'); 
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 로드 시 기존 회원 프로필 정보 가져오기
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await axios.get(`/api/member/profile`, { headers });
        if (response.status === 200) {
          const { memberDetail, hikingLevel, newFileName } = response.data;
          
          setFormData({
            memberDetail: memberDetail || '',
            hikingLevel: hikingLevel || 1,
          });

          if (!newFileName) {
            // 값이 없는 경우 기본 이미지 처리
            setProfileType('default');
            setDefaultImageName('profile_default_1.png');
            setPreviewUrl('/images/profile_default_1.png');
          } else if (newFileName.startsWith('http')) {
            // 완전한 URL 형태인 경우
            setPreviewUrl(newFileName);
          } else if (newFileName.includes('profile_default_')) {
            // 기본 프로필 이미지 경로인 경우 (/images/profile_default_1.png 또는 profile_default_1.png)
            setProfileType('default');
            const fileName = newFileName.split('/images/').pop();
            setDefaultImageName(fileName);
            setPreviewUrl(`/images/${fileName}`);
          } else {
            // 커스텀 업로드 파일인 경우 (member/..., upload/... 등)
            setProfileType('custom');
            setCustomFile(null);
            
            // API_BASE_URL과 경로 결합
            const cleanPath = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
            setPreviewUrl(`${cleanPath}`);
          }
        }
      } catch (error) {
        console.error('기존 프로필 로드 실패:', error);
        alert('프로필 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'hikingLevel' ? parseInt(value, 10) : value,
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uploadData = new FormData();
    
    uploadData.append('memberDetail', formData.memberDetail);
    uploadData.append('hikingLevel', formData.hikingLevel);
    uploadData.append('profileType', profileType); // default 인지 custom 인지 구분값 전송

    if (profileType === 'default') {
      uploadData.append('defaultImageName', defaultImageName);
    } else if (profileType === 'custom' && customFile) {
      uploadData.append('profileFile', customFile);
    }

    try {
      const response = await axios.put(`/api/member/updateProfile`, uploadData);

      if (response.status === 200) {
        // 백엔드로부터 응답받은 새 토큰과 이미지 저장 경로 정보 추출
        const { accessToken, accessTokenExpirationTime, updatedProfileImg } = response.data;

        // 1. 브라우저 로컬 스토리지 및 공통 헤더 토큰 교체
        localStorage.setItem("accessToken", accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 2. 리덕스 디스패치 시 새 프로필 이미지 경로 정보 명시하여 실시간 헤더 반영
        const newExpireTime = new Date().getTime() + Number(accessTokenExpirationTime);
        dispatch(loginF({
          isUser: { 
            ...isUser,
            profileImg: updatedProfileImg, // 헤더 컴포넌트 동기화용 필드 업데이트
            role: isUser?.role
          },
          expireTime: newExpireTime
        }));

        alert('프로필 수정이 정상적으로 완료되었습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 에러:', error);
      alert('프로필 수정 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;

  return (
    <div className="proChange_form_box">
      <form onSubmit={handleSubmit} className='join_step_wrap'>
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
                    title={`기본 프로필 ${index + 1}`}
                  >
                    {isSelected && <div className='avatar_badge'>✓</div>}
                  </div>
                );
              })}

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

        <div className="join_btn_group">
          <button type="submit" className='join_submit_btn'>
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileChange;