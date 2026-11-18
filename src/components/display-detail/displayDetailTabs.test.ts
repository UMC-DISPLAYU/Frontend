import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDetailTab } from '@/components/common/detail/useDetailTab';

import { getDisplayDetailTabs } from './displayDetail.utils';

const h = vi.hoisted(() => ({
  params: new URLSearchParams(),
  replace: vi.fn(),
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useEffect: () => {},
  useRef: () => ({ current: null }),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock('@/hooks/useReplaceSearchParams', () => ({
  useReplaceSearchParams: () => [h.params, h.replace],
}));

const emptyIntro = getDisplayDetailTabs(
  { content: null, contentCategories: [] },
  { hasWorks: true },
);
const withIntro = getDisplayDetailTabs(
  { content: '소개', contentCategories: [] },
  { hasWorks: true },
);
const reviewsOnly = getDisplayDetailTabs(
  { content: null, contentCategories: [] },
  { hasWorks: false },
);

beforeEach(() => {
  h.replace.mockClear();
});

describe('소개 탭이 빠진 전시 상세의 주소(?tab=)', () => {
  it.each([[''], ['?tab=intro'], ['?tab=unknown']])('%s 로 들어오면 작품 탭을 연다', (search) => {
    h.params = new URLSearchParams(search);
    expect(useDetailTab(emptyIntro).activeTab).toBe('works');
    // 주소를 고쳐 쓰지 않으므로 뒤로가기 단계가 쌓이지 않는다
    expect(h.replace).not.toHaveBeenCalled();
  });

  it('?tab=reviews · ?tab=works 는 그대로 연다', () => {
    h.params = new URLSearchParams('?tab=reviews');
    expect(useDetailTab(emptyIntro).activeTab).toBe('reviews');
    h.params = new URLSearchParams('?tab=works');
    expect(useDetailTab(emptyIntro).activeTab).toBe('works');
  });

  it('작품 탭을 고르면 기본 탭이라 ?tab= 을 지운다(replace)', () => {
    h.params = new URLSearchParams('?tab=reviews');
    useDetailTab(emptyIntro).selectTab('works');
    const next = h.replace.mock.calls[0][0] as (prev: URLSearchParams) => URLSearchParams;
    expect(next(h.params).has('tab')).toBe(false);
  });

  it('소개 탭이 있으면 ?tab=intro · 주소 없음 모두 소개를 연다', () => {
    h.params = new URLSearchParams('?tab=intro');
    expect(useDetailTab(withIntro).activeTab).toBe('intro');
    h.params = new URLSearchParams();
    expect(useDetailTab(withIntro).activeTab).toBe('intro');
  });
});

describe('소개 · 작품 탭이 모두 빠진 전시 상세의 주소(?tab=)', () => {
  it.each([[''], ['?tab=intro'], ['?tab=works']])('%s 로 들어오면 후기 탭을 연다', (search) => {
    h.params = new URLSearchParams(search);
    expect(useDetailTab(reviewsOnly).activeTab).toBe('reviews');
    expect(h.replace).not.toHaveBeenCalled();
  });
});
