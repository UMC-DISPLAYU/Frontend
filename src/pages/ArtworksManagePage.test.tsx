import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';
import { ArtworkAuthorChoiceSheet } from '@/components/artwork-register';
import { DeleteConfirmDialog, ManageScreen, OrderScreen } from '@/components/artworks-manage';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';
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
  data: { artworks: [] as unknown[] },
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
  DeleteConfirmDialog: () => null,
  ManageScreen: () => null,
  OrderScreen: () => null,
}));
vi.mock('@/components/common', () => ({ ErrorView: () => null, LoadingView: () => null }));
vi.mock('@/components/exhibition-work', () => ({ ExhibitionWorkLayout: () => null }));
vi.mock('@/components/ui', () => ({
  Skeleton: () => null,
  SkeletonList: () => null,
}));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
// 컴포넌트를 함수로 직접 호출하는 테스트라 훅 상태 없이 isPending 을 그대로 쓴다
vi.mock('@/hooks/useSkeleton', () => ({
  useSkeleton: (isPending: boolean) => ({ showSkeleton: isPending, skeletonProps: {} }),
}));
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
        {
          userId: 3,
          displayNickname: '김서윤',
          nickname: 'blue.note',
          role: 'TEAM_MEM',
          accepted: true,
        },
      ],
    },
  }),
}));
vi.mock('@/hooks/queries/useDisplayArtworks', () => ({
  useDisplayArtworks: () => ({ data: h.data }),
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
  h.data = { artworks: h.artworks };
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

it('끌어서 놓을 때마다 바로 저장하고, 실패하면 직전 순서로 되돌린다', () => {
  enterOrder();
  expect(h.order.reset).toHaveBeenCalledOnce();
  const reorder = (works: Work[]) =>
    (get(OrderScreen).props.onReorder as (works: Work[]) => void)(works);
  reorder([...(get(OrderScreen).props.works as Work[])].reverse());
  expect(h.order.mutate).toHaveBeenCalledWith([2, 1], expect.any(Object));
  expect(ids(get(OrderScreen))).toEqual([2, 1]);

  h.order.mutate.mock.calls[0][1].onError();
  expect(ids(get(OrderScreen))).toEqual([1, 2]);
  h.order.error = failure;
  expect(render().find((node) => node.props.role === 'alert')!.props.children).toContain('서버');
});

it('저장 중에는 다음 순서 변경을 받지 않는다', () => {
  enterOrder();
  h.order.isPending = true;
  expect(get(OrderScreen).props.disabled).toBe(true);
  (get(OrderScreen).props.onReorder as (works: Work[]) => void)(
    [...(get(OrderScreen).props.works as Work[])].reverse(),
  );
  expect(h.order.mutate).not.toHaveBeenCalled();
});

it('저장 뒤 목록을 다시 불러오면 서버 순서를 그대로 보여준다', () => {
  enterOrder();
  (get(OrderScreen).props.onReorder as (works: Work[]) => void)(
    [...(get(OrderScreen).props.works as Work[])].reverse(),
  );
  h.data = { artworks: [...h.artworks].reverse() };
  call(get(OrderScreen), 'onDone');
  expect(ids(get(ManageScreen))).toEqual([2, 1]);
  h.data = { artworks: [...h.artworks] };
  expect(ids(get(ManageScreen))).toEqual([1, 2]);
});

it('삭제 실패는 확인창을 유지하고 중복 요청을 막으며 성공 후에만 닫는다', () => {
  h.remove.error = failure;
  const manage = get(ManageScreen);
  (manage.props.onDelete as (work: Work) => void)((manage.props.works as Work[])[0]);
  expect(h.remove.reset).toHaveBeenCalledOnce();
  const dialog = () => get(DeleteConfirmDialog);
  expect(dialog().props.title).toBe('작품을 삭제할까요?');
  call(dialog(), 'onConfirm');
  expect(h.remove.mutate).toHaveBeenCalledWith(1, expect.any(Object));
  h.remove.error = failure;
  expect(dialog().props.open).toBe(true);
  expect(dialog().props.errorMessage).toContain('서버');
  h.remove.isPending = true;
  expect(dialog().props.isDeleting).toBe(true);
  call(dialog(), 'onConfirm');
  expect(h.remove.mutate).toHaveBeenCalledTimes(1);
  h.remove.isPending = false;
  expect(h.toast).not.toHaveBeenCalled();
  h.remove.mutate.mock.calls[0][1].onSuccess();
  expect(dialog().props.open).toBe(false);
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
    { userId: 3, name: '김서윤', caption: 'blue.note', disabled: false },
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

it('메인 탭에서도 순서 편집을 그 자리에서 연다', () => {
  const manage = render(true).find((node) => node.type === ManageScreen)!;
  call(manage, 'onEditOrder');
  expect(h.navigate).not.toHaveBeenCalled();
  expect(render(true).some((node) => node.type === OrderScreen)).toBe(true);
});

it('카드를 누르면 그 작품의 미리보기로 간다', () => {
  const onOpen = get(ManageScreen).props.onOpen as (work: Work) => void;
  onOpen({ id: 2 } as Work);
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/artworks/2/preview');
});

it('정렬 권한이 없는 팀원은 mode=order URL로도 정렬 화면을 열 수 없다', () => {
  h.userId = 2;
  h.search = 'mode=order';
  expect(get(ManageScreen)).toBeDefined();
  expect(render().some((node) => node.type === OrderScreen)).toBe(false);
});

it('순서 편집 중 콘텐츠 탭을 누르면 저장을 기다리지 않고 바로 이동한다', () => {
  h.search = 'mode=order';
  (get(ExhibitionWorkLayout).props.onTabChange as (tab: string) => void)('contents');
  expect(h.order.mutate).not.toHaveBeenCalled();
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
