import { expect, it } from 'vitest';

import { formatDisplayPeriod } from './formatDisplayPeriod';

it('같은 해면 시작일에만 연도를 표시한다', () => {
  expect(formatDisplayPeriod('2026-06-10', '2026-06-20')).toBe('2026.06.10 - 06.20');
});

it('해를 넘기면 종료일에도 연도를 표시한다', () => {
  expect(formatDisplayPeriod('2026-12-20', '2027-01-05')).toBe('2026.12.20 - 2027.01.05');
});

it('형식이 다른 날짜는 받은 값을 그대로 표시한다', () => {
  expect(formatDisplayPeriod('미정', '2026-06-20')).toBe('미정 - 2026.06.20');
});
