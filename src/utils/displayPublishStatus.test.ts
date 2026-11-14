import { describe, expect, it } from 'vitest';

import { isDisplayPublishStatus } from './displayPublishStatus';

describe('isDisplayPublishStatus', () => {
  it.each(['DRAFT', 'PENDING_REVIEW', 'REJECTED', 'PUBLISHED'])('%s 는 공개 상태다', (status) => {
    expect(isDisplayPublishStatus(status)).toBe(true);
  });

  it.each([undefined, null, '', 'UPCOMING', 'published', 'toString', '__proto__'])(
    '%s 는 공개 상태가 아니다',
    (status) => {
      expect(isDisplayPublishStatus(status)).toBe(false);
    },
  );
});
