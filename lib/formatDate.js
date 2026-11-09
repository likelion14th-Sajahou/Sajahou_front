const DEADLINE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// API의 날짜·시각(2026-11-08T23:59:00+09:00)을 '11/8(일) 자정'처럼 바꾼다. 23:59는 자정으로 쓴다(R-07).
export function formatDeadline(value) {
  const parts = Object.fromEntries(DEADLINE_FORMAT.formatToParts(new Date(value)).map(({ type, value: part }) => [type, part]));
  const time = `${parts.hour}:${parts.minute}`;
  return `${parts.month}/${parts.day}(${parts.weekday}) ${time === "23:59" ? "자정" : time}`;
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
