import React from 'react';
import '../../css/mountain/mountainVideo.css';

const MountainVideoBg = () => {
  return (
    <div className="cinematic-bg-wrapper">
      {/* 1. 하늘과 구름 레이어 */}
      <div className="scene-layer sky-layer"></div>
      
      {/* 2. 메인 산 레이어 (mt_bg_02.png) */}
      <div className="scene-layer mountain-layer"></div>
      
      {/* 3. 앞쪽 나무 레이어 (mt_bg_03.png) */}
      <div className="scene-layer tree-layer"></div>
    </div>
  );
};

export default MountainVideoBg;