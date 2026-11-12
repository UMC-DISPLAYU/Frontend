import { describe, expect, it } from 'vitest';

import { formatExhibitionPeriod } from './formatExhibitionPeriod';

describe('formatExhibitionPeriod', () => {
  it('같은 해면 끝 날짜의 연도를 뺀다', () => {
    expect(formatExhibitionPeriod('2026-11-12', '2026-11-18')).toBe('2026.11.12 - 11.18');
  });

  it('해가 바뀌면 끝 날짜에도 연도를 붙인다', () => {
    expect(formatExhibitionPeriod('2026-12-28', '2027-01-05')).toBe('2026.12.28 - 2027.01.05');
  });

  it('하루 전시이거나 끝 날짜가 없으면 시작 날짜만 쓴다', () => {
    expect(formatExhibitionPeriod('2026-11-12', '2026-11-12')).toBe('2026.11.12');
    expect(formatExhibitionPeriod('2026-11-12', null)).toBe('2026.11.12');
  });

  it('시각이 붙은 값도 시간대 변환 없이 날짜만 읽는다', () => {
    expect(formatExhibitionPeriod('2026-12-31T23:30:00', '2027-01-01T00:30:00Z')).toBe(
      '2026.12.31 - 2027.01.01',
    );
  });

  it('날짜 형식이 아니면 받은 값을 그대로 돌려준다', () => {
    expect(formatExhibitionPeriod('미정', '2026-11-18')).toBe('미정');
    expect(formatExhibitionPeriod('2026-11-12', '미정')).toBe('2026.11.12');
  });
});
