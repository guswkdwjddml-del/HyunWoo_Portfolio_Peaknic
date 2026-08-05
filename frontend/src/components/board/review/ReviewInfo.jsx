import { useNavigate } from "react-router-dom";
import "../../../css/board/review/reviewInfo.css";
import "../../../css/board/boardLayout.css";
const ReviewCrewInfo = ({ crew }) => {

  //크루 카드에서 받아오는 이미지
  let image = "/images/mountain/no_image.png";

  //사진 클릭하면 이동
  const navigate = useNavigate();

  if (crew.crewImage) {
    image = `${crew.crewImage}`;
  }


  return (
    <div
      className="reviewCrewInfo"
      onClick={() => navigate(`/crew/${crew.crewId}`)}
    >
      <div className="reviewCrewInfo-image">
        <img src={image} alt={crew.crewName} />
      </div>

      <div className="reviewCrewInfo-body">
        <h3>{crew.crewName}</h3>

        <p>⛰ {crew.mountainName}</p>

        <p>👤 {crew.crewMemberName}</p>

        <p>📅 {crew.crewStartDate?.substring(0, 10)}</p>
      </div>
    </div>
  );
};

export default ReviewCrewInfo;
