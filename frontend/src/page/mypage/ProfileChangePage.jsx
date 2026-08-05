import React, { useState } from 'react';
import ProfileChange from '../../components/mypage/ProfileChange';

const ProfileChangePage = () => {

  return (
    <div className="info_page_wrap">
      <div className="mypage_page_title">
        <h2>프로필 수정</h2>
      </div>

      <div className="step_content_area">
          <ProfileChange />
      </div>


    </div>
  );
};

export default ProfileChangePage;