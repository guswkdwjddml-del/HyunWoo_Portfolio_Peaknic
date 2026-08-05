import React, { useState } from "react";
import axios from "axios";

const MountainAdmin = () => {
    const [loading, setLoading] = useState({ text: false, image: false, trail: false });
    const [message, setMessage] = useState("");

    const runSync = async (type) => {
        setLoading(prev => ({ ...prev, [type]: true }));
        setMessage(`${type} 수집을 시작합니다...`);

        try {
            // 백엔드 컨트롤러 매핑 주소와 동일하게 POST 요청
            const response = await axios.post(`/api/admin/mountain/${type}`);
            alert(response.data);
            setMessage(response.data);
        } catch (error) {
            console.error(error);
            alert("오류 발생: " + (error.response?.data || "서버 통신 실패"));
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const containerStyle = { padding: "20px", border: "1px solid #ddd", borderRadius: "10px", margin: "20px" };
    const btnStyle = { marginRight: "10px", padding: "10px 20px", cursor: "pointer" };

    return (
        <div style={containerStyle}>
            <h3>🛠 산 데이터 수집 관리자 테스트</h3>
            <div style={{ marginTop: "15px" }}>
                <button style={btnStyle} disabled={loading.text} onClick={() => runSync("text")}>
                    {loading.text ? "수집 중..." : "1. 텍스트 수집 (산림청)"}
                </button>
                <button style={btnStyle} disabled={loading.image} onClick={() => runSync("image")}>
                    {loading.image ? "수집 중..." : "2. 이미지 수집"}
                </button>
                <button style={btnStyle} disabled={loading.trail} onClick={() => runSync("trail")}>
                    {loading.trail ? "수집 중..." : "3. 등산로 수집 (VWorld)"}
                </button>
            </div>
            <div style={{ marginTop: "20px", color: "blue" }}>결과: {message}</div>
        </div>
    );
};

export default MountainAdmin;