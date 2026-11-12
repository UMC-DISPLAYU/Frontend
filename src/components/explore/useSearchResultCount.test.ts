import { describe, expect, it } from 'vitest';

import { formatResultCount, MAX_COUNT_PAGES } from './useSearchResultCount';

describe('formatResultCount', () => {
  it('다음 페이지가 없으면 받은 개수를 그대로 보여준다', () => {
    expect(formatResultCount({ pageItemCounts: [20, 17], hasNextPage: false })).toBe('37');
  });

  it('결과가 없으면 0개다', () => {
    expect(formatResultCount({ pageItemCounts: [0], hasNextPage: false })).toBe('0');
  });

  it('상한보다 적게 받았는데 남아 있으면 아직 세는 중이다', () => {
    const pages = Array.from({ length: MAX_COUNT_PAGES - 1 }, () => 20);
    expect(formatResultCount({ pageItemCounts: pages, hasNextPage: true })).toBeNull();
  });

  it('상한까지 받고도 남아 있으면 + 를 붙인다', () => {
    const pages = Array.from({ length: MAX_COUNT_PAGES }, () => 20);
    expect(formatResultCount({ pageItemCounts: pages, hasNextPage: true })).toBe('100+');
  });

  it('상한 페이지에서 끝나면 + 없이 보여준다', () => {
    const pages = Array.from({ length: MAX_COUNT_PAGES }, () => 20);
    expect(formatResultCount({ pageItemCounts: pages, hasNextPage: false })).toBe('100');
  });
});
