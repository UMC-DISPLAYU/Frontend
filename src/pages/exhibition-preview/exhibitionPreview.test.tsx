import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { ArtworkDetailShell } from '@/components/artworkdetailpage/ArtworkDetailShell';
import { ArtworkPreviewGuestbook } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ErrorView } from '@/components/common';
import { DisplayDetailSkeleton, DisplayDetailView } from '@/components/display-detail';
import { NotFoundView } from '@/components/error-page';
import { policies } from '@/policies/policies';
import type { User } from '@/types/policy';

import { ArtworkDetailPage } from '../ArtworkDetailPage';
import { DisplayContentsPage } from '../display-detail/DisplayContentsPage';

import { ArtworkPreviewPage } from './ArtworkPreviewPage';
import { ContentsPreviewPage } from './ContentsPreviewPage';
import { DisplayPreviewPage } from './DisplayPreviewPage';
import { usePreviewBack } from './usePreviewBack';

const h = vi.hoisted(() => ({
  params: { displayId: '7', artworkId: '3' } as Record<string, string | undefined>,
  search: '',
  navigate: vi.fn(),
  flowBack: vi.fn(),
  display: {
    data: undefined as unknown,
    isPending: false,
    isLoading: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
  works: { data: undefined as unknown, isPending: false },
  artwork: {
    data: undefined as unknown,
    isPending: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useCallback: (callback: unknown) => callback,
}));
vi.mock('react-router-dom', () => ({
  Navigate: () => null,
  useLocation: () => ({ search: h.search ? `?${h.search}` : '' }),
  useParams: () => h.params,
  useNavigate: () => h.navigate,
  useSearchParams: () => [new URLSearchParams(h.search)],
}));
vi.mock('@/components/common', () => ({ ErrorView: () => null }));
vi.mock('@/components/error-page', () => ({ NotFoundView: () => null }));
vi.mock('../display-detail/DisplayContentsPage', () => ({ DisplayContentsPage: () => null }));
vi.mock('@/components/display-detail', () => ({
  DisplayDetailSkeleton: () => null,
  DisplayDetailView: () => null,
}));
vi.mock('@/components/artworkdetailpage/ArtworkDetailShell', () => ({
  ArtworkDetailShell: () => null,
  ArtworkDetailSkeleton: () => null,
}));
vi.mock('@/components/artworkdetailpage/ArtworkActions', () => ({ ArtworkBottomBar: () => null }));
vi.mock('@/components/artworkdetailpage/ArtworkGuestbookTab', () => ({
  ArtworkGuestbookTab: () => null,
  ArtworkPreviewGuestbook: () => null,
}));
vi.mock('@/components/artworkdetailpage/ArtworkIntroTab', () => ({ ArtworkIntroTab: () => null }));
vi.mock('@/components/artworkdetailpage/ArtworkMeta', () => ({ ArtworkMeta: () => null }));
vi.mock('@/components/artworkdetailpage/ArtworkSaveButton', () => ({
  ArtworkSaveButton: () => null,
}));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({ useDisplayDetail: () => h.display }));
vi.mock('@/hooks/queries/useDisplayArtworks', () => ({ useDisplayArtworks: () => h.works }));
vi.mock('@/hooks/queries/useArtworkDetail', () => ({ useArtworkDetail: () => h.artwork }));
vi.mock('@/hooks/queries/useUserProfile', () => ({ useUserMe: () => ({ data: undefined }) }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => h.flowBack }));
vi.mock('@/hooks/useSkeleton', () => ({
  useSkeleton: (pending: boolean) => ({ showSkeleton: pending, skeletonProps: {} }),
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const asElement = (node: ReactNode) => node as Element;

const publicDisplay = {
  displayId: 7,
  status: 'PUBLISHED',
  ownerUserId: 1,
  teamMembers: [],
  period: { startDate: '2026-11-01', endDate: '2026-11-30' },
};
const artworkOf = (displayId: number) => ({
  artworkId: 3,
  artworkName: '작품',
  artistUserId: 1,
  images: [],
  exhibitionInfo: { displayId },
});

const ALL_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'REJECTED', 'PUBLISHED'];

const setHistoryIndex = (idx: number | undefined) =>
  vi.stubGlobal('window', { history: { state: idx === undefined ? null : { idx } } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  h.params = { displayId: '7', artworkId: '3' };
  h.search = '';
  h.display.data = publicDisplay;
  h.display.isPending = false;
  h.display.isLoading = false;
  h.display.error = null;
  h.works.isPending = false;
  h.artwork.data = artworkOf(7);
  h.artwork.isPending = false;
  h.artwork.error = null;
});

describe('미리보기 뒤로가기', () => {
  it('앱 안에서 들어왔으면 이전 화면으로 돌아간다', () => {
    setHistoryIndex(2);
    usePreviewBack('/exhibition/7/work')();
    expect(h.navigate).toHaveBeenCalledWith(-1);
  });

  it.each([0, undefined])('돌아갈 기록이 없으면(idx=%s, 새 탭) 전시 작업으로 바꿔 간다', (idx) => {
    setHistoryIndex(idx);
    usePreviewBack('/exhibition/7/work')();
    expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/work', { replace: true });
  });
});

describe('미리보기 권한(라우트의 DisplayPermissionGuard view)', () => {
  // 비로그인은 AuthGuard 가 먼저 막고, 정책도 막는다. 정책은 전시 상태를 보지 않으므로 공개 여부와 상관없다
  const display = {
    ownerUserId: 1,
    teamMembers: [
      { userId: 2, accepted: true, role: 'MANAGER' },
      { userId: 3, accepted: true, role: 'TEAM_MEM' },
      { userId: 4, accepted: false, role: 'TEAM_MEM' },
    ],
  };
  const user = (id: number | null): User => ({ id, isArtistVerified: true });

  it.each([
    ['비로그인', null],
    ['일반 유저', 9],
    ['초대를 수락하지 않은 유저', 4],
  ])('%s 는 미리보기를 열 수 없다', (_, id) => {
    expect(policies.display.view(user(id), display)).toBe(false);
  });

  it.each([
    ['대표자', 1],
    ['관리자', 2],
    ['팀원', 3],
  ])('%s 는 미리보기를 연다', (_, id) => {
    expect(policies.display.view(user(id), display)).toBe(true);
  });
});

describe('전시 미리보기', () => {
  it.each(ALL_STATUSES)('%s 전시도 상세로 보내지 않고 미리보기 모드로 보여준다', (status) => {
    const display = { ...publicDisplay, status };
    h.display.data = display;
    h.search = 'tab=works';
    const page = asElement(DisplayPreviewPage());
    expect(page.type).toBe(DisplayDetailView);
    expect(page.props.previewMode).toBe(true);
    expect(page.props.display).toBe(display);
  });

  it.each([403, 404])('서버가 %i 를 주면 404 화면을 보인다', (status) => {
    h.display.data = undefined;
    h.display.error = new ApiError('error', { status });
    expect(asElement(DisplayPreviewPage()).type).toBe(NotFoundView);
  });

  it('불러오는 중에는 상세 스켈레톤을 보인다', () => {
    h.display.isPending = true;
    h.display.data = undefined;
    expect(asElement(DisplayPreviewPage()).type).toBe(DisplayDetailSkeleton);
  });

  it('작품 목록을 받기 전에도 상세 스켈레톤을 둔다(작품 탭이 나중에 빠지며 튀지 않게)', () => {
    h.display.data = { ...publicDisplay, status: 'DRAFT' };
    h.works.isPending = true;
    expect(asElement(DisplayPreviewPage()).type).toBe(DisplayDetailSkeleton);
  });

  it('전시 번호가 숫자가 아니면 404 화면을 보인다', () => {
    h.params = { displayId: 'abc' };
    h.display.isPending = true;
    expect(asElement(DisplayPreviewPage()).type).toBe(NotFoundView);
  });

  it('불러오기에 실패하면 다시 시도 화면을 보인다', () => {
    h.display.data = undefined;
    h.display.error = new Error('network');
    const page = asElement(DisplayPreviewPage());
    expect(page.type).toBe(ErrorView);
    (page.props.onRetry as () => void)();
    expect(h.display.refetch).toHaveBeenCalledOnce();
  });
});

describe('작품 미리보기', () => {
  it('주소의 전시 번호를 작품 상세에 넘긴다', () => {
    const page = asElement(ArtworkPreviewPage());
    expect(page.type).toBe(ArtworkDetailPage);
    expect(page.props).toEqual({ previewDisplayId: 7 });
  });

  it.each(ALL_STATUSES)('%s 전시의 작품도 미리보기 주소에서 미리보기 모습으로 보인다', (status) => {
    h.display.data = { ...publicDisplay, status };
    h.search = 'tab=guest';
    const page = asElement(ArtworkDetailPage({ previewDisplayId: 7 }));
    expect(page.type).toBe(ArtworkDetailShell);
    expect(page.props.isPreview).toBe(true);
    expect(asElement(page.props.guestbook as ReactNode).type).toBe(ArtworkPreviewGuestbook);
    const meta = asElement(page.props.label as ReactNode);
    expect(meta.type).toBe(ArtworkMeta);
    expect(meta.props.previewMode).toBe(true);
    const bottomBar = nodes(page.props.bottomBar as ReactNode)[0];
    expect(bottomBar.props.disabled).toBe(true);
    expect(asElement(bottomBar.props.saveButton as ReactNode).props.disabled).toBe(true);
  });

  it.each([403, 404])('작품 조회가 %i 면 미리보기에서도 404 화면을 보인다', (status) => {
    h.artwork.data = undefined;
    h.artwork.error = new ApiError('error', { status });
    expect(asElement(ArtworkDetailPage({ previewDisplayId: 7 })).type).toBe(NotFoundView);
  });

  it('다른 전시의 작품이면 보여주지 않는다', () => {
    h.artwork.data = artworkOf(8);
    expect(asElement(ArtworkDetailPage({ previewDisplayId: 7 })).type).toBe(NotFoundView);
  });

  it('전시 정보가 없는 작품도 보여주지 않는다', () => {
    h.artwork.data = { ...artworkOf(7), exhibitionInfo: null };
    expect(asElement(ArtworkDetailPage({ previewDisplayId: 7 })).type).toBe(NotFoundView);
  });

  it.each(['DRAFT', 'PENDING_REVIEW', 'REJECTED'])(
    '공개되지 않은 전시(%s)의 작품을 공개 주소로 열면 미리보기로 보내지 않고 404 화면을 보인다',
    (status) => {
      h.display.data = { ...publicDisplay, status };
      h.search = 'tab=guest';
      expect(asElement(ArtworkDetailPage()).type).toBe(NotFoundView);
    },
  );

  it.each([403, 404])('작품이 속한 전시 조회가 %i 면 공개 주소에서 404 화면을 보인다', (status) => {
    h.display.data = undefined;
    h.display.error = new ApiError('error', { status });
    expect(asElement(ArtworkDetailPage()).type).toBe(NotFoundView);
  });

  it.each([403, 404])('작품 조회가 %i 면 공개 주소에서 404 화면을 보인다', (status) => {
    h.artwork.data = undefined;
    h.artwork.error = new ApiError('error', { status });
    expect(asElement(ArtworkDetailPage()).type).toBe(NotFoundView);
  });

  it('공개된 전시는 개막 전이어도 공개 작품 상세다', () => {
    h.display.data = {
      ...publicDisplay,
      period: { startDate: '2099-01-01', endDate: '2099-01-31' },
    };
    const page = asElement(ArtworkDetailPage());
    expect(page.type).toBe(ArtworkDetailShell);
    expect(page.props.isPreview).toBe(false);
  });

  it('공개 작품 상세는 그대로 공개 화면이다', () => {
    const page = asElement(ArtworkDetailPage());
    expect(page.type).toBe(ArtworkDetailShell);
    expect(page.props.isPreview).toBe(false);
    const meta = asElement(page.props.label as ReactNode);
    expect(meta.props.previewMode).toBe(false);
  });
});

describe('전시 콘텐츠 미리보기', () => {
  it('주소의 전시 번호를 넘기고, 돌아갈 기록이 없으면 전시 미리보기로 간다', () => {
    setHistoryIndex(0);
    const page = asElement(ContentsPreviewPage());
    expect(page.type).toBe(DisplayContentsPage);
    expect(page.props.previewDisplayId).toBe('7');
    (page.props.onBack as () => void)();
    expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/preview', { replace: true });
  });
});
