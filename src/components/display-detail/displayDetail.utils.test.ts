import { describe, expect, it } from 'vitest';

import {
  formatPeriodDate,
  formatPeriodTime,
  getContentOpenNotice,
  toInstagramLink,
  toWebsiteLink,
} from './displayDetail.utils';

describe('formatPeriodDate', () => {
  it('같은 해면 끝 날짜의 연도를 뺀다', () => {
    expect(formatPeriodDate('2026-10-12', '2026-11-20')).toBe('2026.10.12 - 11.20');
  });

  it('해가 바뀌면 끝 날짜에도 연도를 붙인다', () => {
    expect(formatPeriodDate('2026-12-28', '2027-01-03')).toBe('2026.12.28 - 2027.01.03');
  });

  it('하루짜리이거나 끝 날짜가 없으면 시작 날짜만 보인다', () => {
    expect(formatPeriodDate('2026-10-12', '2026-10-12')).toBe('2026.10.12');
    expect(formatPeriodDate('2026-10-12', null)).toBe('2026.10.12');
    expect(formatPeriodDate(null, '2026-10-12')).toBe('');
  });
});

describe('formatPeriodTime', () => {
  it('초를 뺀다', () => {
    expect(formatPeriodTime('10:00:00', '18:00:00')).toBe('10:00 - 18:00');
    expect(formatPeriodTime('10:00', undefined)).toBe('');
  });
});

describe('toInstagramLink', () => {
  it('아이디 · @아이디 · 주소를 모두 아이디로 바꾼다', () => {
    const expected = { label: '@unfold_2026', href: 'https://www.instagram.com/unfold_2026/' };
    expect(toInstagramLink('unfold_2026')).toEqual(expected);
    expect(toInstagramLink('@unfold_2026')).toEqual(expected);
    expect(toInstagramLink('https://www.instagram.com/unfold_2026/?hl=ko')).toEqual(expected);
  });

  it('비어 있으면 없다', () => {
    expect(toInstagramLink('  ')).toBeNull();
    expect(toInstagramLink(null)).toBeNull();
  });
});

describe('toWebsiteLink', () => {
  it('https 를 붙이고 보이는 글자에서는 https · www · 끝 / 를 뺀다', () => {
    expect(toWebsiteLink('www.unfold.kr/')).toEqual({
      label: 'unfold.kr',
      href: 'https://www.unfold.kr/',
    });
    expect(toWebsiteLink('http://unfold.kr/about')).toEqual({
      label: 'unfold.kr/about',
      href: 'http://unfold.kr/about',
    });
  });

  it('http(s)가 아닌 주소나 잘못된 값은 열지 않는다', () => {
    expect(toWebsiteLink('javascript:alert(1)')).toBeNull();
    expect(toWebsiteLink('')).toBeNull();
  });
});

describe('getContentOpenNotice', () => {
  const period = {
    startDate: '2026-11-16',
    endDate: '2026-12-11',
    startTime: '10:00:00',
    endTime: '18:00:00',
  };
  const at = (value: string) => new Date(value).getTime();

  it('전시 시작일부터 공개면 개막 전까지 언제부터 보이는지 알린다', () => {
    expect(getContentOpenNotice('ON_EXHIBITION', period, at('2026-11-16T09:59:59'))).toBe(
      '11.16부터 노출돼요',
    );
  });

  it('개막 시각이 지나면 안내하지 않는다', () => {
    expect(getContentOpenNotice('ON_EXHIBITION', period, at('2026-11-16T10:00:00'))).toBeNull();
  });

  it('바로 공개면 개막 전이어도 안내하지 않는다', () => {
    expect(getContentOpenNotice('IMMEDIATELY', period, at('2026-11-01T00:00:00'))).toBeNull();
  });
});
