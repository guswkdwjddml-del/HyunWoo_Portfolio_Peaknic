const ActiveCrewTime = (crewStartDate, crewEndDate) => { // yein 작성
  // crewStartDate, crewEndDate 값이 없으면 공백 return
  if (!crewStartDate || !crewEndDate) return "";

  // 활동 종료 시간 - 활동 시작 시간
  const start = new Date(crewStartDate);
  const end = new Date(crewEndDate);
  const diff = end - start;

  // 총 몇분/몇시간인지 계산
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));

  // 며칠 몇시간 몇분인지 계산
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days >= 1) {
    // 1일 이상
    if (hours === 0) return `(${days}일)`;
    return `(${days}일 ${hours}시간)`;
  } else if (totalHours >= 1) {
    // 24시간 미만
    if (minutes === 0) return `(${hours}시간)`;
    return `(${hours}시간 ${minutes}분)`;
  } else {
    // 60분 미만
    return `(${minutes}분)`;
  }
}

export default ActiveCrewTime