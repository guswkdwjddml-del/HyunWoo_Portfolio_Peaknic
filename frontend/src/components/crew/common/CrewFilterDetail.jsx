import React from "react";
import { regionData } from "../../../utils/regionData";

const CrewFilterDetail = ({ filters, availableTags, handleInputChange, handleTagToggle }) => {
  return (
    <div className="crewList-filter-area">
      {/* 1. 지역 및 산 검색 */}
      <div className="filter-section">
        <span className="filter-title">지역 및 산 검색</span>
        <div className="filter-controls">
          <select className="filter-select" name="sido" value={filters.sido} onChange={handleInputChange}>
            <option value="">시/도 선택</option>
            {Object.keys(regionData || {}).map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select className="filter-select" name="sigungu" value={filters.sigungu} onChange={handleInputChange} disabled={!filters.sido}>
            <option value="">시/군/구 선택</option>
            {filters.sido && regionData[filters.sido]?.map((g) => (<option key={g} value={g}>{g}</option>))}
          </select>
          <input className="filter-input" type="text" name="mountainName" value={filters.mountainName} onChange={handleInputChange} placeholder="산 이름 (예: 북한산)" />
        </div>
      </div>

      {/* 2. 해시태그 필터 */}
      <div className="filter-section">
        <span className="filter-title">🏷️ 해시태그</span>
        <div className="tag-filter-group">
          {availableTags.map((tag) => (
            <label key={tag} className={`tag-label ${filters.tags.includes(tag) ? "active" : ""}`}>
              <input type="checkbox" checked={filters.tags.includes(tag)} onChange={() => handleTagToggle(tag)} />
              #{tag}
            </label>
          ))}
        </div>
      </div>

      {/* 3. 난이도 선택 */}
      <div className="filter-section">
        <span className="filter-title">난이도 선택</span>
        <div className="tag-filter-group">
          {[
            { label: "전체", value: "" }, 
            { label: "초보", value: "초보" }, 
            { label: "중수", value: "중수" }, 
            { label: "고수", value: "고수" }
          ].map((level) => (
            <label key={level.label} className={`tag-label ${filters.crewLevel === level.value ? "active" : ""}`}>
              <input 
                type="radio" 
                name="crewLevel" 
                value={level.value} 
                checked={filters.crewLevel === level.value} 
                onChange={handleInputChange} 
                style={{ display: "none" }} /* 기본 브라우저 라디오 숨김 */
              />
              {level.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrewFilterDetail;