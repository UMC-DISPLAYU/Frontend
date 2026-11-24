import { describe, expect, it } from 'vitest';

import {
  addMonths,
  formatMonthTitle,
  formatPickedDate,
  getCalendarDates,
  getCalendarDays,
  getHeatLevel,
  isSameDay,
} from './mapCalendar';
import { isOpenOn } from './mapExhibition';

const NOW = new Date(2026, 11, 5, 15, 30);
const day = (month: number, date: number, year = 2026) => new Date(year, month - 1, date);
const ymd = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

describe('isOpenOn', () => {
  const exhibition = { startDate: '2026-12-05', endDate: '2026-12-09' };

  it('시작일 · 종료일 당일을 포함한다', () => {
    expect(isOpenOn(exhibition, day(12, 5))).toBe(true);
    expect(isOpenOn(exhibition, day(12, 9))).toBe(true);
  });

  it('시작 전날 · 종료 다음날은 열려 있지 않다', () => {
    expect(isOpenOn(exhibition, day(12, 4))).toBe(false);
    expect(isOpenOn(exhibition, day(12, 10))).toBe(false);
  });

  it('하루짜리 전시는 그날만 열려 있다', () => {
    const oneDay = { startDate: '2026-12-31', endDate: '2026-12-31' };
    expect(isOpenOn(oneDay, day(12, 31))).toBe(true);
    expect(isOpenOn(oneDay, day(1, 1, 2027))).toBe(false);
  });

  it('시각은 무시하고 날짜로만 판단한다', () => {
    expect(isOpenOn(exhibition, new Date(2026, 11, 9, 23, 59))).toBe(true);
    expect(isOpenOn(exhibition, new Date(2026, 11, 5, 0, 0))).toBe(true);
  });
});

describe('getCalendarDates', () => {
  it('1일이 든 주의 일요일부터 마지막 날이 든 주의 토요일까지 채운다', () => {
    // 2026-12-01 은 화요일, 12-31 은 목요일
    const dates = getCalendarDates(day(12, 1));
    expect(dates).toHaveLength(35);
    expect(ymd(dates[0])).toBe('11/29');
    expect(dates[0].getDay()).toBe(0);
    expect(ymd(dates[dates.length - 1])).toBe('1/2');
    expect(dates[dates.length - 1].getDay()).toBe(6);
  });

  it('1일이 일요일이고 마지막 날이 토요일이면 앞뒤를 채우지 않는다', () => {
    // 2026-02-01 은 일요일, 02-28 은 토요일
    const dates = getCalendarDates(day(2, 1));
    expect(dates).toHaveLength(28);
    expect(ymd(dates[0])).toBe('2/1');
    expect(ymd(dates[27])).toBe('2/28');
  });

  it('한 달 안의 아무 날을 줘도 같은 달을 만든다', () => {
    expect(getCalendarDates(day(12, 20)).map(ymd)).toEqual(getCalendarDates(day(12, 1)).map(ymd));
  });
});

describe('addMonths', () => {
  it('연도를 넘어 이전 · 다음 달로 간다', () => {
    expect(addMonths(day(12, 1), 1)).toEqual(day(1, 1, 2027));
    expect(addMonths(day(1, 1, 2027), -1)).toEqual(day(12, 1));
  });
});

describe('getHeatLevel', () => {
  it('없으면 0, 가장 많은 날은 4단계다', () => {
    expect(getHeatLevel(0, 3)).toBe(0);
    expect(getHeatLevel(3, 3)).toBe(4);
  });

  it('하나라도 열렸으면 최소 1단계다', () => {
    expect(getHeatLevel(1, 10)).toBe(1);
    expect(getHeatLevel(1, 3)).toBe(2);
    expect(getHeatLevel(2, 3)).toBe(3);
  });
});

describe('getCalendarDays', () => {
  const exhibitions = [
    { startDate: '2026-11-20', endDate: '2026-12-01' },
    { startDate: '2026-12-01', endDate: '2026-12-02' },
    { startDate: '2026-12-31', endDate: '2027-01-10' },
  ];
  const days = getCalendarDays(day(12, 1), exhibitions, NOW);
  const find = (month: number, date: number, year = 2026) =>
    days.find((item) => isSameDay(item.date, day(month, date, year)));

  it('그달 날짜만 세고, 앞뒤 달 칸은 0으로 둔다', () => {
    expect(find(11, 30)).toMatchObject({ inMonth: false, count: 0, level: 0 });
    expect(find(1, 1, 2027)).toMatchObject({ inMonth: false, count: 0, level: 0 });
  });

  it('월 경계에 걸친 전시도 그달 날짜에 센다', () => {
    expect(find(12, 1)).toMatchObject({ inMonth: true, count: 2, level: 4 });
    expect(find(12, 2)?.count).toBe(1);
    expect(find(12, 3)?.count).toBe(0);
    expect(find(12, 31)?.count).toBe(1);
  });

  it('오늘 앞의 날은 지난 날, 오늘은 지난 날이 아니다', () => {
    expect(find(12, 4)).toMatchObject({ isPast: true, isToday: false });
    expect(find(12, 5)).toMatchObject({ isPast: false, isToday: true });
    expect(find(12, 6)).toMatchObject({ isPast: false, isToday: false });
  });
});

describe('formatting', () => {
  it('달 제목과 고른 날을 두 자리로 보여준다', () => {
    expect(formatMonthTitle(day(1, 15, 2027))).toBe('2027.01');
    expect(formatPickedDate(day(12, 8))).toBe('12.08 화');
  });
});
