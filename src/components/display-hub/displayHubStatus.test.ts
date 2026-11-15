import { describe, expect, it } from 'vitest';

import { formatDisplayHubMonthDay, getDisplayHubStatus } from './displayHubStatus';

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

describe('formatDisplayHubMonthDay', () => {
  it('월.일만 돌려준다', () => {
    expect(formatDisplayHubMonthDay('2026-05-28')).toBe('05.28');
  });
});
