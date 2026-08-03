/**
 * 날짜 문자열을 'MM.DD' 형식으로 변환
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day}`;
}

/**
 * '2026.09.22' 처럼 입력된 값에서 연도만 추출
 * 연도를 읽을 수 없으면 올해를 반환
 */
export function toProductionYear(value: string): number {
  const year = Number(value.slice(0, 4));

  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}
