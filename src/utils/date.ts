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

/**
 * 24시간 이내면 상대 시간('N분 전', 'N시간 전'), 지나면 'YYYY.MM.DD' 절대 날짜
 */
export function formatLoungeTime(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}
