import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// 부모(MountainDetail)로부터 산 ID를 전달받아 해당 산의 리뷰 목록을 렌더링
const MountainReviewList = ({ mountainId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  // 산 ID가 존재할 때마다 백엔드 컨트롤러(/api/mountains/{id}/reviews)에 데이터를 요청
  useEffect(() => {
    if (mountainId) {
      axios.get(`/api/mountains/${mountainId}/reviews`)
        .then(res => setReviews(res.data))
        .catch(err => console.error("리뷰 목록 불러오기 실패:", err));
    }
  }, [mountainId]);

  // 특정 리뷰 카드를 클릭하면 해당 게시글의 상세 페이지로 즉시 이동
  const handleReviewClick = (id) => {
    navigate(`/review/detail/${id}`);
  };

  return (
    <div className="mountain-review-section">
      <h3 className="section-title">후기</h3>

      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="empty-message">아직 작성된 리뷰가 없습니다.</p>
        ) : (
          reviews.map(review => {
            // 백엔드 BoardDto의 newFileNames 배열을 사용하여 이미지 경로를 올바르게 매핑합니다.
            const thumbnail = (review.newFileNames && review.newFileNames.length > 0)
              ? `${review.newFileNames[0]}`
              : '/default-image.png';

            return (
              <div
                key={review.id}
                className="review-card"
                onClick={() => handleReviewClick(review.id)}
              >
                <div className="review-image-wrapper">
                  <img src={thumbnail} alt="리뷰 썸네일" className="review-thumbnail" />
                </div>
                <div className="review-content">
                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-likes">❤️ {review.likeCount || 0}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MountainReviewList;