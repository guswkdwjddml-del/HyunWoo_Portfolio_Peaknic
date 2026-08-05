import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { logoutF } from '../../store/slice/authSlice';

const Info = ({ onNextStep }) => {
  const dispatch = useDispatch();

  // 요구 명세 필드를 모두 포함한 상태 초기화
  const [formData, setFormData] = useState({
    userName: '',
    phone: '',
    address: '',
    gender: '남성', // 기본값
    messageAgree: false,
  });

  const [loading, setLoading] = useState(true);

  // 🔄 컴포넌트 마운트 시 DB에서 현재 유저의 전체 정보 가져오기 (findBy 기반 API)
  useEffect(() => {
    const fetchFullUserData = async () => {
      try {
        const response = await axios.get(`/api/member/detail`);
        
        // 받아온 DB 데이터 폼에 통째로 바인딩
        const dbData = response.data;
        setFormData({
          userName: dbData.userName || '',
          phone: dbData.phone || '',
          address: dbData.address || '',
          gender: dbData.gender || '남성',
          messageAgree: dbData.messageAgree ?? false,
        });
      } catch (error) {
        console.error('유저 정보 로드 실패:', error);
        alert('회원 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFullUserData();
  }, []);

  const handleInputChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    
    // 라디오 버튼이나 체크박스, 혹은 일반 텍스트 박스 형태에 따른 분기 처리
    if (type === 'radio') {
      // 라디오 버튼의 경우 id 대신 name을 기준으로 구분
      const targetName = name;
      const targetValue = value === 'true' ? true : value === 'false' ? false : value;
      setFormData((prev) => ({ ...prev, [targetName]: targetValue }));
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [id]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userName.trim()) {
      alert('이름은 필수 항목입니다.');
      return;
    }
    if (!formData.address.trim()) {
      alert('주소는 필수 항목입니다.');
      return;
    }

    try {
      
      // 1. 백엔드 수정 API 호출
      await axios.put(`/api/member/update`, formData);

      alert('회원정보 수정이 완료되었습니다. 안전한 세션을 위해 다시 로그인해 주세요.');

      // 2. 백엔드 로그아웃 실행 및 리덕스 클리어
      await axios.post(`/api/member/logout`);
      dispatch(logoutF());
      delete axios.defaults.headers.common['Authorization'];
      
      // 3. 부모 컴포넌트에게 신호를 주어 3단계(재 로그인) 화면으로 전환
      onNextStep();
    } catch (error) {
      console.error('정보 수정 실패:', error);
      alert('정보 수정에 실패했습니다. 입력값을 확인해 주세요.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>회원 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="step_form_box">
      <div className="form_box_header">
        <h3>개인회원 정보 수정</h3>
        <span className="required_notice"><span className="dot">•</span> 표시된 부분은 필수 입력 항목입니다.</span>
      </div>

      <form onSubmit={handleInfoSubmit} className="mypage_form">
        
        {/* 1. 이름 */}
        <div className="input_inline_group">
          <label htmlFor="userName">성명(이름) <span className="red_dot">*</span></label>
          <div className="input_input_input_btn_wrapper">
            <input
              type="text"
              id="userName"
              placeholder="이름을 입력해주세요."
              value={formData.userName}
              onChange={handleInputChange}
              className="mypage_input"
            />
          </div>
        </div>

        {/* 2. 연락처 */}
        <div className="input_inline_group">
          <label htmlFor="phone">연락처 <span className="red_dot">*</span></label>
          <div className="input_input_input_btn_wrapper">
            <input
              type="text"
              id="phone"
              placeholder="연락처를 입력해주세요."
              value={formData.phone}
              onChange={handleInputChange}
              className="mypage_input"
            />
          </div>
        </div>

        {/* 3. 주소 */}
        <div className="input_inline_group">
          <label htmlFor="address">주소 <span className="red_dot">*</span></label>
          <div className="input_input_input_btn_wrapper">
            <input
              type="text"
              id="address"
              placeholder="주소(예: 서울시 마포구)를 입력해주세요."
              value={formData.address}
              onChange={handleInputChange}
              className="mypage_input"
            />
          </div>
        </div>

        {/* 4. 성별 (고용24st 라디오 버튼) */}
        <div className="input_inline_group">
          <label>성별 <span className="red_dot">*</span></label>
          <div className="input_radio_group">
            <label className="radio_label">
              <input
                type="radio"
                name="gender"
                value="남성"
                checked={formData.gender === '남성'}
                onChange={handleInputChange}
              />
              <span>남성</span>
            </label>
            <label className="radio_label">
              <input
                type="radio"
                name="gender"
                value="여성"
                checked={formData.gender === '여성'}
                onChange={handleInputChange}
              />
              <span>여성</span>
            </label>
          </div>
        </div>

        {/* 7. 정보수신동의 (고용24st 동의/비동의 구성) */}
        <div className="input_inline_group">
          <label>정보수신동의 <span className="red_dot">*</span></label>
          <div className="input_radio_group">
            <label className="radio_label">
              <input
                type="radio"
                name="messageAgree"
                value="true"
                checked={formData.messageAgree === true}
                onChange={handleInputChange}
              />
              <span>동의함</span>
            </label>
            <label className="radio_label">
              <input
                type="radio"
                name="messageAgree"
                value="false"
                checked={formData.messageAgree === false}
                onChange={handleInputChange}
              />
              <span>동의안함</span>
            </label>
          </div>
        </div>

        <div className="form_action_row">
          <button type="submit" className="form_submit_btn info_save">수정 완료</button>
        </div>
      </form>
    </div>
  );
};

export default Info;