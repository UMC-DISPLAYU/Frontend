import { describe, expect, it } from 'vitest';

import { formatNotificationTime } from './formatNotificationTime';

// 서버는 시간대 표시 없는 UTC 시각을 준다
const NOW = new Date('2026-12-10T09:00:00Z').getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString().slice(0, 19);

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatNotificationTime', () => {
  it('1분 안은 방금', () => {
    expect(formatNotificationTime(ago(0), NOW)).toBe('방금');
    expect(formatNotificationTime(ago(59 * 1000), NOW)).toBe('방금');
  });

  it('1시간 안은 N분 전, 하루 안은 N시간 전', () => {
    expect(formatNotificationTime(ago(MINUTE), NOW)).toBe('1분 전');
    expect(formatNotificationTime(ago(59 * MINUTE), NOW)).toBe('59분 전');
    expect(formatNotificationTime(ago(HOUR), NOW)).toBe('1시간 전');
    expect(formatNotificationTime(ago(DAY - 1000), NOW)).toBe('23시간 전');
  });

  it('하루 ~ 이틀은 어제, 6일까지는 N일 전', () => {
    expect(formatNotificationTime(ago(DAY), NOW)).toBe('어제');
    expect(formatNotificationTime(ago(2 * DAY), NOW)).toBe('2일 전');
    expect(formatNotificationTime(ago(7 * DAY - 1000), NOW)).toBe('6일 전');
  });

  it('7일부터는 날짜, 지난해면 연도까지', () => {
    expect(formatNotificationTime('2026-11-28T03:00:00', NOW)).toBe('11.28');
    expect(formatNotificationTime('2025-12-01T03:00:00', NOW)).toBe('2025.12.01');
  });

  it('미래 시각은 방금, 읽을 수 없는 값은 빈 문자열', () => {
    expect(formatNotificationTime(ago(-HOUR), NOW)).toBe('방금');
    expect(formatNotificationTime('잘못된 값', NOW)).toBe('');
  });
});
