const DEADLINE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// API의 날짜·시각을 한국 시각의 '11/8(일) 23:59'처럼 표시한다(R-07).
export function formatDeadline(value) {
  const parts = Object.fromEntries(DEADLINE_FORMAT.formatToParts(new Date(value)).map(({ type, value: part }) => [type, part]));
  const time = `${parts.hour}:${parts.minute}`;
  return `${parts.month}/${parts.day}(${parts.weekday}) ${time}`;
}

const TIME_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// 임시 저장 시각을 '22:40'처럼 바꾼다(R-03).
export function formatTime(value) {
  return TIME_FORMAT.format(new Date(value));
}

// API의 날짜('2026-11-13')를 '11/13'처럼 짧게 바꾼다(프로젝트 시작일·기록 날짜, 11/13 디자인).
// 날짜만 있는 값이라 시간대 계산 없이 글자로 자른다. 형식이 다르면 받은 값을 그대로 둔다.
export function formatMonthDay(value) {
  const match = /^\d{4}-(\d{2})-(\d{2})/.exec(value ?? "");
  return match ? `${Number(match[1])}/${Number(match[2])}` : value;
}
