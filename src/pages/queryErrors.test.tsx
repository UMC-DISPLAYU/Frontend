import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { ErrorView } from '@/components/common/ErrorView';

import { DisplayDetailPage } from './DisplayDetailPage';
import { DisplayInvitationLinkPage } from './DisplayInvitationLinkPage';
import { SearchPage } from './SearchPage';

const h = vi.hoisted(() => ({
  token: 'token' as string | null,
  id: '1',
  query: {
    data: undefined as unknown,
    error: null as Error | null,
    isPending: false,
    isLoading: false,
    isError: false,
    isFetchNextPageError: false,
    hasNextPage: true,
    isFetchingNextPage: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
  },
  scroll: vi.fn(),
  back: vi.fn(),
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => [typeof initial === 'function' ? initial() : initial, vi.fn()],
  useEffect: () => {},
  useMemo: (factory: () => unknown) => factory(),
  useRef: () => ({ current: null }),
}));
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: h.id, token: 'invitation' }),
  useLocation: () => ({ state: null }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Navigate: () => null,
}));
vi.mock('@tanstack/react-query', async (original) => ({
  ...(await original<typeof import('@tanstack/react-query')>()),
  useQuery: () => h.query,
}));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({ useDisplayDetail: () => h.query }));
vi.mock('@/hooks/queries/useDisplayBrowse', () => ({ useInfiniteSearchDisplays: () => h.query }));
vi.mock('@/hooks/useNearbyDisplays', () => ({ useNearbyDisplays: () => ({ data: [] }) }));
vi.mock('@/hooks/useInfiniteScroll', () => ({ useInfiniteScroll: h.scroll }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => h.back }));
vi.mock('@/hooks/usePendingRedirect', () => ({ useReserveRedirectAfterLogin: vi.fn() }));
vi.mock('@/stores/authStore', () => ({ useAuthStore: () => h.token }));
vi.mock('@/components/common', async () => ({
  ErrorView: (await import('@/components/common/ErrorView')).ErrorView,
  LoadingView: () => <div>로딩 중</div>,
}));
vi.mock('@/components/displaydetailpage', () => ({
  ArtworkTab: () => null,
  BottomFixedBar: () => null,
  DetailTabNav: () => null,
  DisplaySaveButton: () => null,
  ExhibitionMeta: () => null,
  HeroSlider: () => <div>전시 상세</div>,
  IntroTab: () => null,
  ReviewTab: () => null,
}));
vi.mock('@/components/search', async () => ({
  ...(await import('@/components/search/filter/filterOptions')),
  ExhibitionCard: () => <div>기존 전시 카드</div>,
  ExhibitionMap: () => null,
  ExhibitionMapCard: () => null,
  FilterChip: () => null,
  FilterModal: () => null,
}));
const nodes = (node: ReactNode): ReactElement<Record<string, unknown>>[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const retry = (tree: ReactNode) =>
  (nodes(tree).find((node) => node.type === ErrorView)!.props.onRetry as () => void)();
beforeEach(() => {
  Object.assign(h.query, {
    data: undefined,
    error: null,
    isPending: false,
    isLoading: false,
    isError: false,
    isFetchNextPageError: false,
  });
  h.id = '1';
  h.token = 'token';
  vi.clearAllMocks();
  vi.stubGlobal('sessionStorage', { getItem: () => null });
});

it('검색 장애는 빈 결과가 아니며 재시도 성공 시 빈 결과/목록을 표시한다', () => {
  h.query.error = new ApiError('server', { status: 500 });
  h.query.isError = true;
  let tree = SearchPage();
  expect(renderToStaticMarkup(tree)).toContain('서버');
  expect(renderToStaticMarkup(tree)).not.toContain('결과가 없습니다');
  retry(tree);
  expect(h.query.refetch).toHaveBeenCalledTimes(1);
  h.query.error = null;
  h.query.isError = false;
  h.query.data = { pages: [{ exhibitions: [] }] };
  tree = SearchPage();
  expect(renderToStaticMarkup(tree)).toContain('결과가 없습니다');
  h.query.data = { pages: [{ exhibitions: [{ displayId: 1 }] }] };
  expect(renderToStaticMarkup(SearchPage())).toContain('기존 전시 카드');
});

it('추가 페이지 실패는 기존 카드를 유지하고 추가 페이지만 다시 요청한다', () => {
  h.query.data = { pages: [{ exhibitions: [{ displayId: 1 }] }] };
  h.query.error = new ApiError('network', { transportCode: 'ERR_NETWORK' });
  h.query.isError = true;
  h.query.isFetchNextPageError = true;
  const tree = SearchPage();
  const html = renderToStaticMarkup(tree);
  expect(html).toContain('기존 전시 카드');
  expect(html).toContain('네트워크');
  expect(h.scroll).toHaveBeenCalledWith(expect.objectContaining({ hasNextPage: false }));
  retry(tree);
  expect(h.query.fetchNextPage).toHaveBeenCalledTimes(1);
  expect(h.query.refetch).not.toHaveBeenCalled();
});

it.each([403, 404, 500])('상세 HTTP %i를 구분하고 뒤로가기 대신 다시 조회한다', (status) => {
  h.query.error = new ApiError('internal', { status });
  const tree = DisplayDetailPage();
  expect(renderToStaticMarkup(tree)).toContain(
    status === 403 ? '권한' : status === 404 ? '찾을 수' : '서버',
  );
  retry(tree);
  expect(h.query.refetch).toHaveBeenCalledTimes(1);
  expect(h.back).not.toHaveBeenCalled();
  h.query.error = null;
  h.query.data = { displayId: 1 };
  expect(renderToStaticMarkup(DisplayDetailPage())).toContain('전시 상세');
});

it('잘못된 상세 ID에서는 비활성 query의 로딩 대신 뒤로가기를 제공한다', () => {
  h.id = 'bad';
  h.query.isPending = true;
  const tree = DisplayDetailPage();
  expect(renderToStaticMarkup(tree)).toContain('뒤로가기');
  retry(tree);
  expect(h.back).toHaveBeenCalledTimes(1);
});

it.each(['INVALID_DISPLAY_INVITATION_TOKEN', 'DISPLAY_INVITATION_DISABLED'])(
  '초대 %s만 무효 링크로 표시한다',
  (code) => {
    h.query.error = new ApiError('invalid', { status: 404, code });
    expect(renderToStaticMarkup(DisplayInvitationLinkPage())).toContain('유효하지 않은 초대 링크');
    h.query.error = new ApiError('server', { status: 500 });
    const tree = DisplayInvitationLinkPage();
    expect(renderToStaticMarkup(tree)).toContain('서버');
    retry(tree);
    expect(h.query.refetch).toHaveBeenCalledTimes(1);
  },
);

it('정상 초대 조회 후 비로그인은 로그인, 로그인 사용자는 초대 목록으로 이동한다', () => {
  h.query.data = { displayId: 7 };
  h.token = null;
  expect(DisplayInvitationLinkPage().props.to).toBe('/login');
  h.token = 'token';
  expect(DisplayInvitationLinkPage().props.to).toBe('/invitation-request?displayId=7');
});
