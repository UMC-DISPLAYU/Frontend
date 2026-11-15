const toDotted = (date: string) => date.replace(/-/g, '.');

/**
 * 프로토타입 flow.js `range`: "2026-05-28", "2026-06-05" → "2026.05.28 - 06.05".
 * 연도가 다르면 끝 날짜에도 연도를 붙이고, 끝 날짜가 없거나 같으면 시작 날짜만 보인다
 */
export const formatDisplayPeriod = (startDate: string, endDate?: string | null) => {
  if (!endDate || startDate === endDate) return toDotted(startDate);
  const end = startDate.slice(0, 4) === endDate.slice(0, 4) ? endDate.slice(5) : endDate;
  return `${toDotted(startDate)} - ${toDotted(end)}`;
};
