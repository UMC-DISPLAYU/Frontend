import { describe, expect, it } from 'vitest';

import { getKoreaToday, hasDisplayStartedInKorea } from './publishTiming';

const at = (iso: string) => new Date(iso).getTime();

describe('getKoreaToday', () => {
  it('한국 자정 직전은 전날, 자정부터는 다음 날이다', () => {
    expect(getKoreaToday(at('2026-11-24T23:59:59.999+09:00'))).toBe('2026-11-24');
    expect(getKoreaToday(at('2026-11-25T00:00:00+09:00'))).toBe('2026-11-25');
  });

  it('UTC 날짜가 아니라 한국 날짜를 쓴다', () => {
    expect(getKoreaToday(at('2026-11-24T15:00:00Z'))).toBe('2026-11-25');
    expect(getKoreaToday(at('2026-11-24T14:59:59Z'))).toBe('2026-11-24');
  });
});

describe('hasDisplayStartedInKorea', () => {
  const now = at('2026-11-25T12:00:00+09:00');

  it.each([
    ['어제', '2026-11-24', true],
    ['오늘', '2026-11-25', true],
    ['내일', '2026-11-26', false],
  ])('시작일이 %s이면 %s', (_, startDate, expected) => {
    expect(hasDisplayStartedInKorea(startDate, now)).toBe(expected);
  });

  it('시작일 한국 자정 직전에는 시작 전, 자정부터는 시작한 것으로 본다', () => {
    expect(hasDisplayStartedInKorea('2026-11-26', at('2026-11-25T23:59:59.999+09:00'))).toBe(false);
    expect(hasDisplayStartedInKorea('2026-11-26', at('2026-11-26T00:00:00+09:00'))).toBe(true);
  });

  it('시각이 붙은 시작일도 날짜만 비교한다', () => {
    expect(hasDisplayStartedInKorea('2026-11-25T10:00:00', now)).toBe(true);
    expect(hasDisplayStartedInKorea('2026-11-26T00:00:00', now)).toBe(false);
  });

  it.each([undefined, '', '2026.11.24'])('알 수 없는 시작일 %s는 시작 전으로 본다', (startDate) => {
    expect(hasDisplayStartedInKorea(startDate, now)).toBe(false);
  });
});
