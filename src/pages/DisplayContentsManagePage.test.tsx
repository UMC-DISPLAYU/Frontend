import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, expect, it, vi } from 'vitest';

import { ContentDeleteConfirmDialog, ContentList } from '@/components/artworks-manage';
import { ExhibitionWorkLayout } from '@/components/exhibition-work';

import { DisplayContentsManagePage } from './DisplayContentsManagePage';

const h = vi.hoisted(() => ({
  states: [] as unknown[],
  stateIndex: 0,
  canManage: true,
  categories: [] as {
    categoryId: number;
    name: string;
    description: string;
    contents: { imageUrl: string }[];
  }[],
  remove: { mutate: vi.fn(), isPending: false },
  reorder: { mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null as Error | null },
  navigate: vi.fn(),
}));

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const index = h.stateIndex++;
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
  useSearchParams: () => [new URLSearchParams()],
  useLocation: () => ({ state: null }),
}));
vi.mock('@/components/common', () => ({ ErrorView: () => null, LoadingView: () => null }));
vi.mock('@/components/exhibition-work', () => ({
  ExhibitionWorkLayout: () => null,
  WorkIcon: () => null,
}));
vi.mock('@/components/artworks-manage', () => ({
  ContentList: () => null,
  ContentDeleteConfirmDialog: () => null,
  MAX_DISPLAY_SECTIONS: 5,
}));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/hooks/usePolicy', () => ({
  useDisplayContentPolicy: () => ({
    createCategory: () => h.canManage,
    editCategory: () => h.canManage,
    deleteCategory: () => h.canManage,
    reorder: () => h.canManage,
  }),
}));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({
  useDisplayDetail: () => ({
    data: { displayId: 7, contentCategories: h.categories },
    isLoading: false,
    isError: false,
  }),
}));
vi.mock('@/hooks/queries/useContentCategories', () => ({
  useDeleteContentCategory: () => h.remove,
  useReorderContentCategories: () => h.reorder,
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const render = (embedded = true) => {
  h.stateIndex = 0;
  return nodes(DisplayContentsManagePage({ embedded }));
};
const get = (tree: Element[], type: unknown) => tree.find((node) => node.type === type)!;
const button = (tree: Element[], text: string) =>
  tree.find(
    (node) =>
      node.type === 'button' && Children.toArray(node.props.children as ReactNode).includes(text),
  )!;
const click = (node: Element) => (node.props.onClick as () => void)();
beforeEach(() => {
  h.states = [];
  h.canManage = true;
  h.categories = [{ categoryId: 11, name: '내부 사진', description: '설명', contents: [] }];
  h.remove.isPending = false;
  Object.assign(h.reorder, { isPending: false, error: null });
  vi.clearAllMocks();
});

type Content = { id: number; title: string };
const list = (tree = render()) => get(tree, ContentList);
const ids = (tree = render()) => (list(tree).props.contents as Content[]).map((item) => item.id);
const sections = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    categoryId: index + 1,
    name: `섹션 ${index + 1}`,
    description: '',
    contents: [],
  }));
const reorder = (next: Content[]) => (list().props.onReorder as (items: Content[]) => void)(next);

it('탭에 넣을 때는 공통 페이지 틀을 중복 렌더하지 않고, 섹션을 누르면 섹션 편집으로 간다', () => {
  expect(render().some((node) => node.type === ExhibitionWorkLayout)).toBe(false);
  expect(get(render(false), ExhibitionWorkLayout).props.activeTab).toBe('contents');
  (list().props.onOpen as (content: Content) => void)({ id: 11, title: '내부 사진' });
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/contents/11');
});

it.each([
  [4, true],
  [5, false],
])('섹션 %i개일 때 섹션 추가 버튼 노출 %s(프로토타입 최대 5개)', (count, visible) => {
  h.categories = sections(count);
  expect(render().some((node) => node.type === 'button' && button([node], '섹션 추가'))).toBe(
    visible,
  );
});

it('섹션 추가를 누르면 섹션 추가 화면으로 간다(프로토타입 11-15 전체 화면)', () => {
  click(button(render(), '섹션 추가'));
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/contents/new');
});

it('편집 · 추가는 권한이 있는 사용자에게만 노출한다', () => {
  h.canManage = false;
  const tree = render();
  expect(tree.some((node) => node.type === 'button')).toBe(false);
  expect(list(tree).props.editing).toBe(false);
  expect(list(tree).props.onDelete).toBeUndefined();
});

it('편집 모드에서 끌어 놓으면 바로 저장하고, 실패하면 직전 순서로 되돌린다', () => {
  h.categories = sections(3);
  click(button(render(), '편집'));
  expect(list().props.editing).toBe(true);
  const items = list().props.contents as Content[];
  reorder([items[2], items[0], items[1]]);
  expect(h.reorder.mutate).toHaveBeenCalledWith([3, 1, 2], expect.any(Object));
  expect(ids()).toEqual([3, 1, 2]);
  h.reorder.mutate.mock.calls[0][1].onError(new Error('Network Error'));
  expect(ids()).toEqual([1, 2, 3]);
  h.reorder.error = new Error('Network Error');
  expect(render().find((node) => node.props.role === 'alert')!.props.children).toBe(
    '네트워크 연결을 확인해주세요.',
  );
});

it('순서 저장 중에는 다음 순서 변경을 받지 않는다', () => {
  h.categories = sections(2);
  click(button(render(), '편집'));
  h.reorder.isPending = true;
  expect(list().props.disabled).toBe(true);
  reorder([...(list().props.contents as Content[])].reverse());
  expect(h.reorder.mutate).not.toHaveBeenCalled();
});

it('마지막 섹션 삭제 성공 뒤 빈 목록에서 다시 추가할 수 있다', () => {
  click(button(render(), '편집'));
  (list().props.onDelete as (content: Content) => void)({ id: 11, title: '내부 사진' });
  const dialog = get(render(), ContentDeleteConfirmDialog);
  expect(dialog.props.open).toBe(true);
  (dialog.props.onConfirm as () => void)();
  expect(h.remove.mutate).toHaveBeenCalledWith(11, expect.any(Object));
  expect(get(render(), ContentDeleteConfirmDialog).props.open).toBe(true);
  h.remove.mutate.mock.calls[0][1].onSuccess();
  h.categories = [];
  expect(get(render(), ContentDeleteConfirmDialog).props.open).toBe(false);
  expect(button(render(), '섹션 추가')).toBeDefined();
});

it('섹션 삭제 실패 시 목록과 확인 창을 유지하고 다시 열면 오류를 지운다', () => {
  const target = { id: 11, title: '내부 사진' };
  click(button(render(), '편집'));
  (list().props.onDelete as (content: Content) => void)(target);
  (get(render(), ContentDeleteConfirmDialog).props.onConfirm as () => void)();
  h.remove.mutate.mock.calls[0][1].onError(new Error('Network Error'));
  const dialog = get(render(), ContentDeleteConfirmDialog);
  expect(dialog.props.open).toBe(true);
  expect(dialog.props.errorMessage).toBe('네트워크 연결을 확인해주세요.');
  expect(ids()).toEqual([11]);

  (dialog.props.onCancel as () => void)();
  (list().props.onDelete as (content: Content) => void)(target);
  expect(get(render(), ContentDeleteConfirmDialog).props.errorMessage).toBeNull();
});
