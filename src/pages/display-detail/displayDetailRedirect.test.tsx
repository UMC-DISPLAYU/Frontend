import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { DisplayDetailSkeleton, DisplayDetailView } from '@/components/display-detail';
import { NotFoundView } from '@/components/error-page';

import { DisplayContentsPage } from './DisplayContentsPage';
import { DisplayDetailPage } from './DisplayDetailPage';

const h = vi.hoisted(() => ({
  params: { id: '7' } as Record<string, string | undefined>,
  search: '',
  display: {
    data: undefined as unknown,
    isPending: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
  works: { data: undefined as unknown, isPending: false },
}));

// 페이지를 함수로 바로 불러 보므로 상태 · 효과 훅은 처음 값만 돌려준다
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useEffect: () => undefined,
  useRef: () => ({ current: null }),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock('react-router-dom', () => ({
  Navigate: () => null,
  useParams: () => h.params,
  useLocation: () => ({ search: h.search }),
}));
vi.mock('@/components/common', () => ({ ErrorView: () => null }));
vi.mock('@/components/common/OptimizedImage', () => ({ OptimizedImage: () => null }));
vi.mock('@/components/error-page', () => ({ NotFoundView: () => null }));
vi.mock('@/components/display-detail', () => ({
  DisplayDetailSkeleton: () => null,
  DisplayDetailView: () => null,
}));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({ useDisplayDetail: () => h.display }));
vi.mock('@/hooks/queries/useDisplayArtworks', () => ({ useDisplayArtworks: () => h.works }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/hooks/useSwipeBack', () => ({ useSwipeBack: () => undefined }));
vi.mock('@/hooks/useReplaceSearchParams', () => ({
  useReplaceSearchParams: () => [new URLSearchParams(h.search), vi.fn()],
}));
vi.mock('@/hooks/useSkeleton', () => ({
  useSkeleton: (pending: boolean) => ({ showSkeleton: pending, skeletonProps: {} }),
}));

const asElement = (node: ReactNode) => {
  if (!isValidElement(node)) throw new Error('element 가 아니다');
  return node as ReactElement<Record<string, unknown>>;
};

const display = (status: string) => ({
  displayId: 7,
  status,
  contentCategories: [{ categoryId: 5, name: '전시 전경', contents: [] }],
});

beforeEach(() => {
  h.search = '';
  h.display.data = undefined;
  h.display.isPending = false;
  h.display.error = null;
  h.works.isPending = false;
});

describe('전시 상세는 작품 목록까지 받은 뒤 그린다', () => {
  it('상세를 받았어도 작품 목록을 기다리는 동안은 스켈레톤을 둔다(작품 탭이 나중에 빠지며 튀지 않게)', () => {
    h.display.data = display('PUBLISHED');
    h.works.isPending = true;
    expect(asElement(DisplayDetailPage()).type).toBe(DisplayDetailSkeleton);
    h.works.isPending = false;
    expect(asElement(DisplayDetailPage()).type).toBe(DisplayDetailView);
  });

  it('상세가 없으면(실패) 작품 목록을 기다리지 않는다', () => {
    h.works.isPending = true;
    expect(asElement(DisplayDetailPage()).type).not.toBe(DisplayDetailSkeleton);
  });
});

const NOT_PUBLIC_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'REJECTED'];
const ALL_STATUSES = [...NOT_PUBLIC_STATUSES, 'PUBLISHED'];

describe('상세 · 미리보기 주소는 서로 보내지 않는다', () => {
  it.each(NOT_PUBLIC_STATUSES)(
    '공개되지 않은 전시(%s)를 /display/:id 로 열면 팀원이어도 404 화면을 보인다',
    (status) => {
      h.display.data = display(status);
      h.search = '?tab=works';
      expect(asElement(DisplayDetailPage()).type).toBe(NotFoundView);
    },
  );

  it('공개된 전시는 개막 전이어도 일반 상세로 보인다', () => {
    h.display.data = display('PUBLISHED');
    const page = asElement(DisplayDetailPage());

    expect(page.type).toBe(DisplayDetailView);
    expect(page.props.previewMode).toBeUndefined();
  });

  it.each([403, 404])('상세 조회가 %i 면 404 화면을 보인다', (status) => {
    h.display.error = new ApiError('error', { status });
    expect(asElement(DisplayDetailPage()).type).toBe(NotFoundView);
    expect(asElement(DisplayContentsPage()).type).toBe(NotFoundView);
  });

  it.each(NOT_PUBLIC_STATUSES)(
    '공개되지 않은 전시(%s)의 콘텐츠를 공개 주소로 열면 404 화면을 보인다',
    (status) => {
      h.display.data = display(status);
      h.search = '?category=5';
      expect(asElement(DisplayContentsPage()).type).toBe(NotFoundView);
    },
  );

  it('공개된 전시의 콘텐츠는 공개 주소에서 그대로 보여 준다', () => {
    h.display.data = display('PUBLISHED');
    h.search = '?category=5';
    const page = asElement(DisplayContentsPage());

    expect(page.type).toBe('div');
  });

  it.each(ALL_STATUSES)('미리보기에서 연 %s 전시의 콘텐츠는 그대로 보여 준다', (status) => {
    h.display.data = display(status);
    h.search = '?category=5';
    const page = asElement(DisplayContentsPage({ previewDisplayId: '7', onBack: vi.fn() }));

    expect(page.type).toBe('div');
  });
});
