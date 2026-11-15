import { describe, expect, it } from 'vitest';

import { formatDisplayPeriod } from './displayPeriod';

describe('formatDisplayPeriod', () => {
  it('같은 해면 끝 날짜의 연도를 생략한다', () => {
    expect(formatDisplayPeriod('2026-05-28', '2026-06-05')).toBe('2026.05.28 - 06.05');
  });

  it('해가 바뀌면 끝 날짜에도 연도를 붙인다', () => {
    expect(formatDisplayPeriod('2026-12-28', '2027-01-05')).toBe('2026.12.28 - 2027.01.05');
  });

  it.each([['2026-11-01'], [''], [null], [undefined]])(
    '끝 날짜가 시작 날짜와 같거나 없으면(%s) 시작 날짜만 보인다',
    (endDate) => {
      expect(formatDisplayPeriod('2026-11-01', endDate)).toBe('2026.11.01');
    },
  );
});
