import { describe, expect, it } from 'vitest';

import {
  formatDisplayHubMonthDay,
  formatDisplayHubPeriod,
  getDisplayHubStatus,
} from './displayHubStatus';

describe('getDisplayHubStatus', () => {
  it.each(['PENDING_REVIEW', 'REJECTED', 'PUBLISHED', 'DRAFT'])(
    '%s를 그대로 돌려준다',
    (status) => {
      expect(getDisplayHubStatus(status)).toBe(status);
    },
  );

  it.each([undefined, '', 'ONGOING'])('알 수 없는 값 %s는 준비 중으로 본다', (status) => {
    expect(getDisplayHubStatus(status)).toBe('DRAFT');
  });
});

describe('formatDisplayHubPeriod', () => {
  it('같은 해면 끝 날짜의 연도를 생략한다', () => {
    expect(formatDisplayHubPeriod('2026-05-28', '2026-06-05')).toBe('2026.05.28 - 06.05');
  });

  it('해가 바뀌면 끝 날짜에도 연도를 붙인다', () => {
    expect(formatDisplayHubPeriod('2026-12-28', '2027-01-05')).toBe('2026.12.28 - 2027.01.05');
  });
});

describe('formatDisplayHubMonthDay', () => {
  it('월.일만 돌려준다', () => {
    expect(formatDisplayHubMonthDay('2026-05-28')).toBe('05.28');
  });
});
