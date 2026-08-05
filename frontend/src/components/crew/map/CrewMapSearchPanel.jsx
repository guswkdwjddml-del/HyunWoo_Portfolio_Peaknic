import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { regionData } from "../../../utils/regionData";


const CrewMapSearchPanel = ({ selectMountain }) => {
  const [sido, setSido] = useState("");
  const [gugun, setGugun] = useState("");
  const [mountainNameInput, setMountainNameInput] = useState("");
  const [mountains, setMountains] = useState([]);

  const searchMountains = async () => {
    if (!mountainNameInput.trim() && !sido) {
      setMountains([]); // 검색어가 없으면 리스트 비우기
      return;
    }
    try {
      const response = await axios.get(`/api/mountains/search`, {
        params: { mountainName: mountainNameInput, sido, sigungu: gugun },
      });
      setMountains(response.data.content || []);
    } catch (err) {
      console.error("산 검색 에러:", err);
    }
  };

  // 검색로직 - 입력값(산 이름, 시/도, 구/군)이 변경될 때마다 자동으로 0.3초 뒤에 검색 실행
  useEffect(() => {
    const delayDebounceTimer = setTimeout(() => {
      searchMountains();
    }, 300);

    return () => clearTimeout(delayDebounceTimer);
  }, [mountainNameInput, sido, gugun]);

  return (
    <div className="modern-search-panel">
      <div className="panel-header">
        <h2>어느 산으로 가시나요?</h2>
        <p>원하는 산이나 지역을 검색해 코스를 찾아보세요.</p>
      </div>

      <div className="modern-search-box">
        <input 
          type="text" 
          placeholder="산 이름 입력 (예: 북한산)"
          value={mountainNameInput}
          onChange={(e) => setMountainNameInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchMountains()}
        />
        <button onClick={searchMountains} className="btn-search-icon">🔍</button>
      </div>

      <div className="modern-filter-row">
        <select value={sido} onChange={(e) => { setSido(e.target.value); setGugun(""); }}>
          <option value="">시/도 전체</option>
          {Object.keys(regionData).map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={gugun} onChange={(e) => setGugun(e.target.value)}>
          <option value="">시/군/구 전체</option>
          {sido && regionData[sido]?.map((g) => (<option key={g} value={g}>{g}</option>))}
        </select>
      </div>

      <div className="modern-list-container">
        {mountains.map((m, idx) => (
          <div className="modern-list-card" key={m.id || idx} onClick={() => selectMountain(m)} >
            <div className="m-icon">⛰️</div>
            <div className="m-info">
              <h4>{m.mountainName}</h4>
              <span>📍 {m.sido} {m.sigungu} | {m.height}m</span>
            </div>
          </div>
        ))}
        {mountains.length === 0 && <div className="empty-state">검색 결과가 없습니다.</div>}
      </div>
    </div>
  );
};
export default CrewMapSearchPanel;