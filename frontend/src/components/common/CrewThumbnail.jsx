// import { API_BACK_SERVER_URL } from '../../utils/commonModule';

// 이미지 기본 값
const NO_IMAGE = "/images/mountain/no_image.png";

// 크루 이미지 가져오기
const CrewThumbnail = ({ crew }) => {
  if (!crew) {
    return <img src={NO_IMAGE} alt="이미지 없음" />;
  }

  let displayImage = NO_IMAGE;

  if (crew.crewFiles?.length > 0) {
    displayImage = `${crew.crewFiles[0].filePath}`;
  } else if (crew.mountainImageUrl) {
    displayImage = crew.mountainImageUrl;
  }

  return (
    <img
      src={displayImage}
      alt={crew.crewName}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = NO_IMAGE;
      }}
    />
  );
};

export default CrewThumbnail