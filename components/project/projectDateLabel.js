// API 날짜는 그대로 두고 프로젝트 시안의 월/일 표기로만 표시한다.
export function projectDateLabel(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return match ? `${Number(match[2])}/${Number(match[3])}` : value;
}
