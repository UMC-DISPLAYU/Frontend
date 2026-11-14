import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { ArtworkAuthorChoiceSheet } from '@/components/artwork-register';
import { ManageScreen, OrderScreen } from '@/components/artworks-manage';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';
import { Overlay } from '@/components/ui';
import type { Work } from '@/types/artworkManage';

import { ArtworksManagePage } from './ArtworksManagePage';

const h = vi.hoisted(() => ({
  states: [] as unknown[],
  index: 0,
  userId: 1,
  search: '',
  artworks: [1, 2].map((id) => ({
    artworkId: id,
    artworkName: `작품 ${id}`,
    artistName: '작가',
    artistUserId: 1,
  })),
  order: { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null as Error | null },
  remove: { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null as Error | null },
  navigate: vi.fn(),
  toast: vi.fn(),
  members: { isPending: false, isError: false, refetch: vi.fn() },
}));
vi.mock('@/stores/toastStore', () => ({ toast: h.toast }));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useMemo: (factory: () => unknown) => factory(),
  useState: (initial: unknown) => {
    const index = h.index++;
    if (!(index in h.states)) h.states[index] = initial;
    return [
      h.states[index],
      (value: unknown) => {
        h.states[index] = typeof value === 'function' ? value(h.states[index]) : value;
      },
    ];
  },
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => h.navigate,
  useParams: () => ({ displayId: '7' }),
  useSearchParams: () => [new URLSearchParams(h.search)],
}));
vi.mock('@/components/artwork-register', async () => ({
  ...(await vi.importActual<typeof import('@/components/artwork-register/proxyAuthor')>(
    '@/components/artwork-register/proxyAuthor',
  )),
  ...(await vi.importActual<typeof import('@/components/artwork-register/artworkTeam')>(
    '@/components/artwork-register/artworkTeam',
  )),
  ArtworkAuthorChoiceSheet: () => null,
}));
vi.mock('@/components/artworks-manage', () => ({
  ManageScreen: () => null,
  OrderScreen: () => null,
}));
vi.mock('@/components/common', () => ({ ErrorView: () => null, LoadingView: () => null }));
vi.mock('@/components/exhibition-work', () => ({ ExhibitionWorkLayout: () => null }));
vi.mock('@/components/ui', () => ({
  Overlay: () => null,
  Skeleton: () => null,
  SkeletonList: () => null,
}));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/hooks/queries/useUserProfile', () => ({
  useUserMe: () => ({ data: { id: h.userId, isVerified: true } }),
}));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({
  useDisplayDetail: () => ({ data: { displayId: 7, ownerUserId: 1 } }),
}));
vi.mock('@/hooks/queries/useDisplayMembers', () => ({
  useDisplayMembers: () => ({
    ...h.members,
    data: {
      members: [
        { userId: 1, displayNickname: '대표', role: 'LEADER', accepted: true },
        { userId: 3, displayNickname: '김서윤', role: 'TEAM_MEM', accepted: true },
      ],
    },
  }),
}));
vi.mock('@/hooks/queries/useDisplayArtworks', () => ({
  useDisplayArtworks: () => ({ data: { artworks: h.artworks } }),
  useUpdateArtworkOrder: () => h.order,
  useDeleteArtwork: () => h.remove,
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const render = (embedded = false) => {
  h.index = 0;
  return nodes(ArtworksManagePage({ embedded }));
};
const get = (type: unknown) => render().find((node) => node.type === type)!;
const call = (node: Element, callback: string) => (node.props[callback] as () => void)();
const enterOrder = () => call(get(ManageScreen), 'onEditOrder');
const ids = (node: Element) => (node.props.works as Work[]).map((work) => work.id);
const failure = new ApiError('server', { status: 500 });

beforeEach(() => {
  h.states = [];
  h.userId = 1;
  h.search = '';
  h.artworks = [1, 2].map((id) => ({
    artworkId: id,
    artworkName: `작품 ${id}`,
    artistName: '작가',
    artistUserId: 1,
  }));
  Object.assign(h.order, { isPending: false, error: null });
  Object.assign(h.members, { isPending: false, isError: false });
  Object.assign(h.remove, { isPending: false, error: null });
  vi.clearAllMocks();
  vi.stubGlobal('window', { history: { state: { idx: 4 } } });
  h.order.reset.mockImplementation(() => {
    h.order.error = null;
  });
  h.remove.reset.mockImplementation(() => {
    h.remove.error = null;
  });
});

it('정렬 실패는 편집 순서와 화면을 유지하며 성공 후에만 목록으로 돌아간다', () => {
  h.order.error = failure;
  enterOrder();
  expect(h.order.reset).toHaveBeenCalledOnce();
  const order = get(OrderScreen);
  (order.props.onReorder as (works: Work[]) => void)([...(order.props.works as Work[])].reverse());
  call(get(OrderScreen), 'onDone');
  expect(h.order.mutate).toHaveBeenCalledWith([2, 1], expect.any(Object));
  h.order.error = failure;
  expect(ids(get(OrderScreen))).toEqual([2, 1]);
  expect(render().find((node) => node.props.role === 'alert')!.props.children).toContain('서버');
  h.order.isPending = true;
  call(get(OrderScreen), 'onDone');
  expect(get(OrderScreen).props.disabled).toBe(true);
  expect(h.order.mutate).toHaveBeenCalledTimes(1);
  h.order.isPending = false;
  call(get(OrderScreen), 'onDone');
  expect(h.order.mutate).toHaveBeenCalledTimes(2);
  h.artworks.reverse();
  h.order.mutate.mock.calls[1][1].onSuccess();
  expect(ids(get(ManageScreen))).toEqual([2, 1]);
});

it('순서를 바꾸지 않고 완료하면 저장 요청 없이 목록으로 돌아간다', () => {
  enterOrder();
  call(get(OrderScreen), 'onDone');
  expect(h.order.mutate).not.toHaveBeenCalled();
  expect(get(ManageScreen)).toBeDefined();
});

it('삭제 실패는 확인창을 유지하고 중복 요청을 막으며 성공 후에만 닫는다', () => {
  h.remove.error = failure;
  const manage = get(ManageScreen);
  (manage.props.onDelete as (work: Work) => void)((manage.props.works as Work[])[0]);
  expect(h.remove.reset).toHaveBeenCalledOnce();
  const confirm = () => {
    const buttons = nodes(get(Overlay).props.footer as ReactNode);
    call(
      buttons.find((node) => node.type === 'button' && node.props.children === '삭제하기')!,
      'onClick',
    );
  };
  confirm();
  expect(h.remove.mutate).toHaveBeenCalledWith(1, expect.any(Object));
  h.remove.error = failure;
  expect(get(Overlay).props.open).toBe(true);
  expect(
    nodes(get(Overlay).props.children as ReactNode).find((node) => node.props.role === 'alert')!
      .props.children,
  ).toContain('서버');
  h.remove.isPending = true;
  const pending = nodes(get(Overlay).props.footer as ReactNode).find(
    (node) => node.type === 'button' && node.props.children === '삭제 중',
  )!;
  expect(pending.props.disabled).toBe(true);
  call(pending, 'onClick');
  expect(h.remove.mutate).toHaveBeenCalledTimes(1);
  h.remove.isPending = false;
  expect(h.toast).not.toHaveBeenCalled();
  h.remove.mutate.mock.calls[0][1].onSuccess();
  expect(get(Overlay).props.open).toBe(false);
  expect(h.toast).toHaveBeenCalledWith('작품을 삭제했어요');
});

it('팀원이 작품 추가를 누르면 바로 작품 등록으로 이동한다', () => {
  h.userId = 2;
  call(get(ManageScreen), 'onAdd');
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/artworks/new');
  expect(get(ArtworkAuthorChoiceSheet).props.open).toBe(false);
});

it('대표자는 누구의 작품인지 고른 뒤 작품 등록으로 이동한다', () => {
  call(get(ManageScreen), 'onAdd');
  expect(h.navigate).not.toHaveBeenCalled();

  const sheet = get(ArtworkAuthorChoiceSheet);
  expect(sheet.props.open).toBe(true);
  expect(sheet.props.candidates).toEqual([
    { userId: 3, name: '김서윤', caption: '팀원', disabled: false },
  ]);

  (sheet.props.onSelectMine as () => void)();
  expect(h.navigate).toHaveBeenLastCalledWith('/exhibition/7/artworks/new', { replace: true });
  (sheet.props.onSelectMember as (userId: number) => void)(3);
  expect(h.navigate).toHaveBeenLastCalledWith('/exhibition/7/artworks/new?as=member&userId=3', {
    replace: true,
  });
  (sheet.props.onSelectName as (name: string) => void)('김하늘');
  expect(h.navigate).toHaveBeenLastCalledWith(
    `/exhibition/7/artworks/new?as=name&name=${encodeURIComponent('김하늘')}`,
    { replace: true },
  );
});

it('메인 탭에서 순서 편집을 누르면 저장 뒤로가기가 있는 별도 화면으로 이동한다', () => {
  const manage = render(true).find((node) => node.type === ManageScreen)!;
  call(manage, 'onEditOrder');
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/artworks?mode=order');
  h.states = [];
  h.search = 'mode=order';
  const order = get(OrderScreen);
  (order.props.onReorder as (works: Work[]) => void)([...(order.props.works as Work[])].reverse());
  call(get(ExhibitionWorkLayout), 'onBack');
  expect(h.order.mutate).toHaveBeenCalledWith([2, 1], expect.any(Object));
  expect(get(OrderScreen)).toBeDefined();
  h.order.mutate.mock.calls[0][1].onSuccess();
  expect(get(ManageScreen)).toBeDefined();
});

it('정렬 권한이 없는 팀원은 mode=order URL로도 정렬 화면을 열 수 없다', () => {
  h.userId = 2;
  h.search = 'mode=order';
  expect(get(ManageScreen)).toBeDefined();
  expect(render().some((node) => node.type === OrderScreen)).toBe(false);
});

it('정렬 중 콘텐츠 탭 전환도 저장 성공을 기다리고 실패하면 이동하지 않는다', () => {
  h.search = 'mode=order';
  const order = get(OrderScreen);
  (order.props.onReorder as (works: Work[]) => void)([...(order.props.works as Work[])].reverse());
  const changeTab = () =>
    (get(ExhibitionWorkLayout).props.onTabChange as (tab: string) => void)('contents');
  changeTab();
  expect(h.order.mutate).toHaveBeenCalledWith([2, 1], expect.any(Object));
  h.order.error = failure;
  expect(h.navigate).not.toHaveBeenCalled();
  expect(ids(get(OrderScreen))).toEqual([2, 1]);
  changeTab();
  h.order.mutate.mock.calls[1][1].onSuccess();
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/work?tab=contents', { replace: true });
});

it('대신 등록 시트에 팀원 목록 조회 상태를 넘겨 불러오는 중 · 실패를 팀원 없음과 구분한다', () => {
  expect(get(ArtworkAuthorChoiceSheet).props.candidatesStatus).toBe('success');

  h.members.isPending = true;
  expect(get(ArtworkAuthorChoiceSheet).props.candidatesStatus).toBe('pending');

  h.members.isPending = false;
  h.members.isError = true;
  const sheet = get(ArtworkAuthorChoiceSheet);
  expect(sheet.props.candidatesStatus).toBe('error');
  call(sheet, 'onRetryCandidates');
  expect(h.members.refetch).toHaveBeenCalledOnce();
});
