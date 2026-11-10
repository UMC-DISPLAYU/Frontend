import { describe, expect, it } from 'vitest';

import {
  buildMonthDays,
  formatDotDate,
  isValidTimeRange,
  pickRangeDate,
  TIME_OPTIONS,
  toIsoDate,
} from './displaySchedule';

describe('날짜 형식', () => {
  it('로컬 날짜를 YYYY-MM-DD 로 만든다', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('점으로 구분해 보여준다', () => {
    expect(formatDotDate('2026-11-20')).toBe('2026.11.20');
  });
});

describe('buildMonthDays', () => {
  it('2026년 11월은 일요일에 시작하고 30일까지 있다', () => {
    const days = buildMonthDays(2026, 10);
    expect(days[0]).toBe('2026-11-01');
    expect(days).toHaveLength(30);
  });

  it('첫 요일 앞은 빈칸으로 채운다', () => {
    const days = buildMonthDays(2026, 11);
    expect(days.slice(0, 2)).toEqual([null, null]);
    expect(days[2]).toBe('2026-12-01');
    expect(days.at(-1)).toBe('2026-12-31');
  });
});

describe('pickRangeDate', () => {
  it('처음 누르면 시작일, 다음에 누르면 종료일', () => {
    const first = pickRangeDate({ start: null, end: null }, '2026-11-20');
    expect(first).toEqual({ start: '2026-11-20', end: null });
    expect(pickRangeDate(first, '2026-11-26')).toEqual({ start: '2026-11-20', end: '2026-11-26' });
  });

  it('같은 날을 두 번 누르면 하루 전시', () => {
    expect(pickRangeDate({ start: '2026-11-20', end: null }, '2026-11-20')).toEqual({
      start: '2026-11-20',
      end: '2026-11-20',
    });
  });

  it('시작일보다 앞이거나 이미 둘 다 골랐으면 새로 시작한다', () => {
    expect(pickRangeDate({ start: '2026-11-20', end: null }, '2026-11-19')).toEqual({
      start: '2026-11-19',
      end: null,
    });
    expect(pickRangeDate({ start: '2026-11-20', end: '2026-11-26' }, '2026-11-22')).toEqual({
      start: '2026-11-22',
      end: null,
    });
  });
});

describe('운영 시간', () => {
  it('30분 단위 48개', () => {
    expect(TIME_OPTIONS).toHaveLength(48);
    expect(TIME_OPTIONS[0]).toBe('00:00');
    expect(TIME_OPTIONS.at(-1)).toBe('23:30');
  });

  it('종료 시간은 시작 시간보다 늦어야 한다', () => {
    expect(isValidTimeRange('10:00', '18:00')).toBe(true);
    expect(isValidTimeRange('10:00', '10:00')).toBe(false);
    expect(isValidTimeRange('18:00', '09:30')).toBe(false);
  });
});
