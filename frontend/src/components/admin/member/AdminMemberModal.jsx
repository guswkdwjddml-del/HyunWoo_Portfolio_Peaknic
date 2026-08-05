import axios from 'axios';
import React, { useEffect, useState } from 'react'

// 3개의 기본 이미지 파일명 정의
const DEFAULT_IMAGES = [
  'profile_default_1.png', 'profile_default_2.png', 'profile_default_3.png'
];


const AdminMemberModal = ({ memberId, memberInfo, memberListFn, onClose }) => {

  // MemberDto 초기 상태 설정
  const [member, setMember] = useState({
    userEmail: "",
    userPw: "",
    userName: "",
    phone: "",
    address: "",
    memberDetail: "",
    gender: "MALE",
    role: "JUNIOR",
    hikingLevel: 1,
    messageAgree: false,
  });

  useEffect(() => {
    if (memberInfo) {
      setMember(memberInfo);
    } else {
      setMember({
        userEmail: "",
        userPw: "",
        userName: "",
        phone: "",
        address: "",
        memberDetail: "",
        gender: "남성",
        role: "JUNIOR",
        hikingLevel: 1,
        messageAgree: true,
      });
    }
  }, [memberInfo]);

  // 모든 Input의 변경 사항을 하나의 함수로 동적 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember((prev) => ({
      ...prev,
      [name]:
        name === "hikingLevel"
          ? parseInt(value, 10)
          : name === "messageAgree"
            ? value === "true"
            : value,
    }));

    if (name === "userEmail") {
      setIsEmailChecked(false);
    }
  };

  //==== 신규회원 등록 관련 ====
  const isCreateMode = memberInfo === null;

  // 프로필 이미지 추가
  const [profileType, setProfileType] = useState('default');
  const [defaultImageName, setDefaultImageName] = useState('profile_default_1.png');
  const [customFile, setCustomFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/images/profile_default_1.png");
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

  //이메일 중복 체크
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const handleCheckEmail = async () => {
    if (!member.userEmail) {
      alert('이메일을 입력해 주세요.');
      return;
    }

    try {
      const response = await axios.post(`/api/member/checkEmail`, {
        userEmail: member.userEmail
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

  const memberWriteFn = async () => {
    try {
      const uploadData = new FormData();

      // 프로필 설정
      Object.keys(member).forEach((key) => {
        uploadData.append(key, member[key]);
      });

      if (profileType === 'default') {
        uploadData.append('defaultImageName', defaultImageName);
      } else if (profileType === 'custom' && customFile) {
        uploadData.append('profileFile', customFile);
      }

      await axios.post(
        `/api/member/signup`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("회원이 등록되었습니다.");
      onClose();
      memberListFn();
    } catch (error) {
      console.error(error);
    }
  }

  const memberUpdateFn = async () => {
    try {
      await axios.put(`/admin/member/update/${memberId}`, member);
      alert("회원정보가 수정되었습니다.");
      onClose();
      memberListFn();
    } catch (error) {
      console.error(error);
    }
  }

  const memberDeleteFn = async () => {

    if (!window.confirm("정말 이 회원을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(`/admin/member/delete/${memberId}`);
      alert("회원정보가 삭제되었습니다.");
      onClose();
      memberListFn();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="memberModal" onClick={onClose}>
      <div
        className="memberModal-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="memberModal-header">
          <h2>{isCreateMode ? "회원 등록" : "회원 상세"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="memberModal-body">
          {!isCreateMode ? (
            <>
              <label className="memberInfo_label">프로필</label>
              <img
                src={
                  member.newFileName
                    ? `${member.newFileName}`
                    : "/images/profile_default_1.png"
                }
                alt="프로필"
              />
              <label className="memberInfo_label">아이디</label>
              <input
                type="text"
                value={member.id || ""}
                readOnly
                className="memberInfo"
              />

            </>
          ) : (
            <>
              <label className="memberInfo_label">프로필 만들기</label>
              <div className="memberProfileUpload">
                {/* 미리보기 */}
                <div className="profilePreview">
                  <img src={previewUrl} alt="프로필" />
                </div>
                {/* 우측: 4x1 그리드 선택존 */}
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
                  {/* 4번째 칸: 파일 직접 업로드 단추 */}
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
            </>
          )}
          <label className='memberInfo_label'>이메일</label>
          <div className='memberInfo_email_wrap'>
            <input
              type="email"
              name="userEmail"
              value={member.userEmail || ""}
              onChange={handleChange}
              readOnly={!isCreateMode}
              placeholder={isCreateMode ? "example@hiking.com" : null}
              className='memberInfo'
            />
            {isCreateMode && (
              <button
                type="button"
                onClick={handleCheckEmail}
                className='memberInfo_check_btn'
              >
                중복확인
              </button>
            )}
            {isEmailChecked && (
              <small className='memberInfo_check'>✓ 사용 가능한 이메일입니다.</small>
            )}
          </div>
          <label className='memberInfo_label'>비밀번호</label>
          <input
            type="password"
            name="userPw"
            onChange={handleChange}
            readOnly={!isCreateMode}
            placeholder={isCreateMode ? "비밀번호" : "****"}
            className='memberInfo'
          />
          <label className='memberInfo_label'>이름</label>
          <input
            type="text"
            name="userName"
            value={member.userName || ""}
            onChange={handleChange}
            readOnly={!isCreateMode}
            placeholder={isCreateMode ? "김산타" : null}
            className='memberInfo'
          />
          <label className='memberInfo_label'>전화번호</label>
          <input
            type="text"
            name="phone"
            value={member.phone || ""}
            onChange={handleChange}
            readOnly={!isCreateMode}
            placeholder={isCreateMode ? "010-XXXX-XXXX" : null}
            className='memberInfo'
          />
          <label className='memberInfo_label'>주소</label>
          <input
            type="text"
            name="address"
            value={member.address || ""}
            onChange={handleChange}
            readOnly={!isCreateMode}
            placeholder={isCreateMode ? "주소" : null}
            className='memberInfo'
          />
          <label className='memberInfo_label'>자기소개</label>
          <input
            type="text"
            name="memberDetail"
            value={member.memberDetail || ""}
            onChange={handleChange}
            readOnly={!isCreateMode}
            placeholder={isCreateMode ? "자기소개" : null}
            className='memberInfo'
          />
          <label className='memberInfo_label'>성별</label>
          <div className='memberInfo_radio_group'>
            <label className='memberInfo_radio_label'>
              <input
                type="radio"
                name="gender"
                value="남성"
                checked={member.gender === '남성'}
                onChange={handleChange}
                disabled={!isCreateMode}
              />
              <span>남성</span>
            </label>
            <label className='memberInfo_radio_label'>
              <input
                type="radio"
                name="gender"
                value="여성"
                checked={member.gender === '여성'}
                onChange={handleChange}
                disabled={!isCreateMode}
              />
              <span>여성</span>
            </label>
          </div>
          {!isCreateMode && (
            <>
              <label className='memberInfo_label'>권한</label>
              <select
                name="role"
                value={member.role || "JUNIOR"}
                onChange={handleChange}
                className="memberInfo"
              >
                <option value="JUNIOR">일반회원(JUNIOR)</option>
                <option value="HOST">구독회원(HOST)</option>
                <option value="ADMIN">관리자(ADMIN)</option>
              </select>
            </>
          )}
          <label className='memberInfo_label'>등산 레벨</label>
          <div className='memberInfo_radio_group'>
            {[1, 2, 3, 4, 5].map((level) => (
              <label key={level} className='memberInfo_radio_label'>
                <input
                  type="radio"
                  name="hikingLevel"
                  value={level}
                  checked={member.hikingLevel === level}
                  onChange={handleChange}
                />
                <span>Lv.{level}</span>
              </label>
            ))}
          </div>
          <label className='memberInfo_label'>정보수신동의</label>
          <div className='memberInfo_radio_group'>
            <label className='memberInfo_radio_label'>
              <input
                type="radio"
                name="messageAgree"
                value="true"
                checked={member.messageAgree === true}
                onChange={handleChange}
                disabled={!isCreateMode}
              />
              <span>동의함</span>
            </label>
            <label className='memberInfo_radio_label'>
              <input
                type="radio"
                name="messageAgree"
                value="false"
                checked={member.messageAgree === false}
                onChange={handleChange}
                disabled={!isCreateMode}
              />
              <span>동의안함</span>
            </label>
          </div>
        </div>

        <div className="memberModal-footer">
          {isCreateMode ? (
            <>
              <button onClick={memberWriteFn}>등록</button>
              <button onClick={onClose}>취소</button>
            </>
          ) : (
            <>
              <button onClick={memberUpdateFn}>수정</button>
              <button onClick={memberDeleteFn}>삭제</button>
              <button onClick={onClose}>닫기</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMemberModal
