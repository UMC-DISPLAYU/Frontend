import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DisplayDetailView } from '@/components/display-detail';

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
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
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
});

describe('공개 상세 주소의 미리보기는 미리보기 화면 하나로 보낸다', () => {
  it.each(['DRAFT', 'PENDING_REVIEW', 'REJECTED'])(
    '공개되지 않은 전시(%s)를 /display/:id 로 열면 탭을 유지한 채 미리보기 주소로 바꿔 간다',
    (status) => {
      h.display.data = display(status);
      h.search = '?tab=works';
      const page = asElement(DisplayDetailPage());

      expect(page.type).not.toBe(DisplayDetailView);
      expect(page.props).toMatchObject({ to: '/exhibition/7/preview?tab=works', replace: true });
    },
  );

  it('공개된 전시는 개막 전이어도 일반 상세로 보인다', () => {
    h.display.data = display('PUBLISHED');
    const page = asElement(DisplayDetailPage());

    expect(page.type).toBe(DisplayDetailView);
    expect(page.props.previewMode).toBeUndefined();
  });

  it('등록 중 전시의 콘텐츠를 공개 주소로 열면 미리보기 안의 콘텐츠 주소로 바꿔 간다', () => {
    h.display.data = display('DRAFT');
    h.search = '?category=5';
    const page = asElement(DisplayContentsPage());

    expect(page.props).toMatchObject({
      to: '/exhibition/7/preview/contents?category=5',
      replace: true,
    });
  });

  it('미리보기에서 연 콘텐츠는 그대로 보여 준다', () => {
    h.display.data = display('DRAFT');
    h.search = '?category=5';
    const page = asElement(DisplayContentsPage({ previewDisplayId: '7', onBack: vi.fn() }));

    expect(page.props.to).toBeUndefined();
  });
});
