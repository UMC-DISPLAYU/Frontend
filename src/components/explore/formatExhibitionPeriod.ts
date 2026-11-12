const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const toDotted = (date: string) => {
  const match = DATE_PATTERN.exec(date);
  return match ? { year: match[1], text: `${match[1]}.${match[2]}.${match[3]}` } : null;
};

/**
 * 탐색 카드 기간 표기. 앞에 연도를 붙이고, 끝 날짜의 연도는 시작과 다를 때만 쓴다.
 * 예: 2026.11.12 - 11.18 / 2026.12.28 - 2027.01.05 / 하루 전시는 2026.11.12
 * 검색 응답이 날짜만(YYYY-MM-DD) 주므로 시간대 변환 없이 앞 10자리만 읽는다.
 */
export function formatExhibitionPeriod(startedAt: string, endedAt?: string | null) {
  const start = toDotted(startedAt);
  if (!start) return startedAt;

  const end = endedAt ? toDotted(endedAt) : null;
  if (!end || end.text === start.text) return start.text;

  return `${start.text} - ${end.year === start.year ? end.text.slice(5) : end.text}`;
}
