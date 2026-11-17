import { describe, expect, it } from 'vitest';

import { isPreviewDisplay } from './isPreviewDisplay';

describe('isPreviewDisplay', () => {
  it.each(['DRAFT', 'PENDING_REVIEW', 'REJECTED'])(
    '대중에게 공개되지 않은 전시(%s)는 미리보기로 보낸다',
    (status) => {
      expect(isPreviewDisplay({ status })).toBe(true);
    },
  );

  it('심사를 통과해 공개된 전시는 개막 전이어도 공개 전으로 보지 않는다', () => {
    expect(isPreviewDisplay({ status: 'PUBLISHED' })).toBe(false);
  });
});
