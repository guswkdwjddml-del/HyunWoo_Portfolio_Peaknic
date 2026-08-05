// 크루 상태, 뱃지 레이블, CSS 클래스명을 통합 계산해주는 공통 함수
export const getCrewStatusInfo = (crew, participants = [], currentUserEmail = "") => {
  if (!crew) return {};

  const now = new Date();
  const deadline = crew.crewDeadline ? new Date(crew.crewDeadline) : null;
  const startDate = crew.crewStartDate ? new Date(crew.crewStartDate) : null;
  const currentPeople = Math.max(participants.length, crew.currentPeople || 0);

  // 날짜 및 인원 마감 검증
  const isDeadlinePassed = deadline && deadline <= now;
  const isStartPassed = startDate && startDate <= now;
  const isFull = currentPeople >= crew.crewPeople;

  // DB 원본 상태
  const isRecruiting = crew.crewStatus === "RECRUITING";
  const isClosed = crew.crewStatus === "CLOSED";
  const isCompleted = crew.crewStatus === "COMPLETED";
  const isCancelled = crew.crewStatus === "CANCELLED";
  const isDeleted = crew.crewStatus === "DELETED";

  // 프론트엔드 노출용 계산 상태
  const isClosedView = isClosed || (isRecruiting && (isDeadlinePassed || isFull));
  const isBlind = isClosedView || isCompleted || isCancelled || isDeleted;

  // 방장(호스트) 객체 및 여부를 판별
  const host = participants.find(p => p.id === crew.memberId) || null;
  const isHost = (host?.userEmail === currentUserEmail) || (crew.userEmail === currentUserEmail);

  // 일반 참여자이거나 방장인 경우 모두 '참여중'으로 판별
  const isJoined = isHost || participants.some(p => (p.userEmail || p.memberEmail) === currentUserEmail);

  // 상태별 뱃지 텍스트 반환
  const getStatusLabel = () => {
    if (isDeleted) return "삭제됨";
    if (isCancelled) return "모집 취소";
    if (isCompleted) return "활동 완료";
    if (isJoined) return "참여중";
    if (isClosedView) return "모집 마감";
    return "모집중";
  };

  // 상태별 CSS 클래스명 반환
  const getStatusClass = () => {
    if (isDeleted) return "deleted";
    if (isCancelled) return "cancelled";
    if (isCompleted) return "completed";
    if (isJoined) return "joined";
    if (isClosedView) return "closed";
    return "recruiting";
  };

  // 썸네일 블라인드 텍스트 반환
  const getTopLabel = () => {
    if (isDeleted) return "삭제됨";
    if (isCancelled) return "모집 취소";
    if (isCompleted) return "활동 완료";
    if (isClosedView) return "모집 마감";
    return "";
  };

  return {
    isRecruiting, isClosedView, isCompleted, isCancelled, isDeleted, isBlind,
    isJoined, isHost, currentPeople, host,
    label: getStatusLabel(),
    className: getStatusClass(),
    topLabel: getTopLabel()
  };
};