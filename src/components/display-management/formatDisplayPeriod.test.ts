import { expect, it } from 'vitest';

import { formatDisplayPeriod } from './formatDisplayPeriod';

it('연도를 빼고 월.일 형식으로 표시한다', () => {
  expect(formatDisplayPeriod('2026-06-10', '2026-06-20')).toBe('06.10 - 06.20');
});

it('형식이 다른 날짜는 받은 값을 그대로 표시한다', () => {
  expect(formatDisplayPeriod('미정', '2026-06-20')).toBe('미정 - 06.20');
});
