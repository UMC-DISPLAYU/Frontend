import { describe, expect, it } from 'vitest';

import { isPreviewDisplay, isPublishedDisplay } from './isPreviewDisplay';

describe('isPreviewDisplay', () => {
  it('등록 중(DRAFT) 전시는 공개 전이다', () => {
    expect(isPreviewDisplay({ status: 'DRAFT' })).toBe(true);
  });

  it('심사를 통과해 공개된 전시는 개막 전이어도 공개 전으로 보지 않는다', () => {
    expect(isPreviewDisplay({ status: 'PUBLISHED' })).toBe(false);
  });
});

describe('isPublishedDisplay', () => {
  it('심사를 통과해 공개된 전시만 공개 전시다', () => {
    expect(isPublishedDisplay({ status: 'PUBLISHED' })).toBe(true);
    expect(isPublishedDisplay({ status: 'DRAFT' })).toBe(false);
  });
});
