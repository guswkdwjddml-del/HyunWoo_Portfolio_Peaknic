import React, { useEffect, useState } from "react";
import axios from "axios";
import CrewList from "../../components/crew/list/CrewList";


const MyEditCrewPage = () => {
  const [memberId, setMemberId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMemberId = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // 백엔드가 토큰을 보고 이메일을 자체적으로 알아내므로,
        // 프론트는 Authorization 헤더만 실어서 단순 GET 요청!
        const response = await axios.get(`/api/member/findId`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map.of("memberId", ...) 구조이므로 response.data.memberId로 수신
        const fetchedId = response.data?.memberId || response.data?.id || response.data;
        setMemberId(fetchedId);
      } catch (error) {
        console.error("사용자 memberId 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberId();
  }, []);

  if (isLoading) {
    return <div className="myJoinCrew_wrap">로딩 중...</div>;
  }

  return (
    <div className="myJoinCrew_wrap">
      <div className="info_page_wrap">
        <div className="mypage_page_title">
          <h2>생성한 모임 내역</h2>
        </div>
        <CrewList memberId={memberId} />
      </div>
    </div>
  );
};

export default MyEditCrewPage;