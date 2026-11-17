import { parseServerDate } from '@/utils/date';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * 알림함 시간. PM 알림함 명세(noti-demo) 예시를 따른다:
 * 방금 → N분 전 → N시간 전 → 어제 → N일 전(6일까지) → MM.DD(올해) · YYYY.MM.DD(지난해).
 * 댓글 · 후기의 formatRelativeTime 과 문구가 달라 알림함에서만 쓴다
 */
export function formatNotificationTime(createdAt: string, now = Date.now()) {
  const date = parseServerDate(createdAt);
  if (Number.isNaN(date.getTime())) return '';

  const diff = Math.max(0, now - date.getTime());

  if (diff < MINUTE) return '방금';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
  if (diff < 2 * DAY) return '어제';
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}일 전`;

  const monthDay = `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  return date.getFullYear() === new Date(now).getFullYear()
    ? monthDay
    : `${date.getFullYear()}.${monthDay}`;
}
