const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 지금 시각의 한국 날짜("YYYY-MM-DD") */
export const getKoreaToday = (now = Date.now()) =>
  new Date(now + KST_OFFSET_MS).toISOString().slice(0, 10);

/**
 * 서버는 ON_EXHIBITION 을 한국 시간 전시 시작일 00시부터 공개하므로,
 * 시작일이 오늘(한국 날짜)이거나 지났으면 "전시 시작일"과 "심사 승인 시"의 결과가 같다
 */
export const hasDisplayStartedInKorea = (startDate: string | undefined, now = Date.now()) => {
  const date = startDate?.slice(0, 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return date <= getKoreaToday(now);
};
