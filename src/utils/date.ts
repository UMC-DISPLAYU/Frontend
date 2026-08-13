/**
 * 날짜 문자열을 'MM.DD' 형식으로 변환
 */
export function formatDate(dateStr: string): string {
  const date = parseServerDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day}`;
}

/**
 * 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환
 */
export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseServerDate(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 서버가 타임존 표시(Z 또는 +09:00 등) 없이 UTC 시각을 그대로 내려주는 경우를 보정한다.
 * 타임존 표시가 이미 있으면 손대지 않는다 — 서버가 나중에 정상적으로 Z를 붙여 보내도
 * 이중 보정 없이 그대로 안전하게 동작한다.
 */
export function parseServerDate(iso: string): Date {
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasTimezone ? iso : `${iso}Z`);
}

/**
 * 상대 시간 표시. 라운지/전시상세/작품상세 댓글·답글·후기·감상·질문에서 공통으로 쓴다.
 * - 0~1분: '방금 전'
 * - 2~59분: 'N분전' (공백 없음)
 * - 1~23시간: 'N시간전' (공백 없음)
 * - 24시간 이상: 'YYYY.MM.DD' (점 뒤 공백 없음, '며칠 전' 표현 없이 바로 날짜)
 */
export function formatRelativeTime(createdAt: string): string {
  const date = parseServerDate(createdAt);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분전`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}시간전`;

  return formatFullDate(createdAt);
}
