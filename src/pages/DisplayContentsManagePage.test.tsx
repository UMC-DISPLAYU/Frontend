import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, expect, it, vi } from 'vitest';

import {
  ContentCard,
  ContentDeleteConfirmDialog,
  ContentEditSheet,
} from '@/components/artworks-manage';
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
  create: { mutate: vi.fn(), isPending: false },
  remove: { mutate: vi.fn(), isPending: false },
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
vi.mock('@/components/layout', () => ({ useHideFooter: vi.fn() }));
vi.mock('@/components/common', () => ({ ErrorView: () => null, LoadingView: () => null }));
vi.mock('@/components/exhibition-work', () => ({ ExhibitionWorkLayout: () => null }));
vi.mock('@/components/artworks-manage', () => ({
  ContentCard: () => null,
  ContentEditSheet: () => null,
  ContentDeleteConfirmDialog: () => null,
}));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/hooks/usePolicy', () => ({
  useDisplayContentPolicy: () => ({
    createCategory: () => h.canManage,
    editCategory: () => h.canManage,
    deleteCategory: () => h.canManage,
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
  useCreateContentCategory: () => h.create,
  useDeleteContentCategory: () => h.remove,
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
const save = (tree: Element[]) =>
  (
    get(tree, ContentEditSheet).props.onSave as (value: {
      title: string;
      description: string;
    }) => void
  )({ title: '새 섹션', description: '소개' });

beforeEach(() => {
  h.states = [];
  h.canManage = true;
  h.categories = [{ categoryId: 11, name: '내부 사진', description: '설명', contents: [] }];
  h.create.isPending = false;
  h.remove.isPending = false;
  vi.clearAllMocks();
});

it('탭에 넣을 때는 공통 페이지 틀을 중복 렌더하지 않는다', () => {
  expect(render().some((node) => node.type === ExhibitionWorkLayout)).toBe(false);
  expect(get(render(false), ExhibitionWorkLayout).props.activeTab).toBe('contents');
  (get(render(), ContentCard).props.onClick as () => void)();
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/contents/11');
});

it('섹션이 5개를 넘어도 기존 추가 기능과 목록을 유지한다', () => {
  h.categories = Array.from({ length: 6 }, (_, index) => ({
    categoryId: index + 1,
    name: `섹션 ${index + 1}`,
    description: '',
    contents: [],
  }));
  const tree = render();
  expect(tree.filter((node) => node.type === ContentCard)).toHaveLength(6);
  click(button(tree, '섹션 추가'));
  save(render());
  expect(h.create.mutate).toHaveBeenCalledWith(
    { name: '새 섹션', description: '소개' },
    expect.objectContaining({ onSuccess: expect.any(Function) }),
  );
  expect(get(render(), ContentEditSheet).props.open).toBe(true);
  h.create.mutate.mock.calls[0][1].onSuccess();
  expect(get(render(), ContentEditSheet).props.open).toBe(false);
});

it('수정과 삭제는 기존 권한이 있는 사용자에게만 노출한다', () => {
  h.canManage = false;
  const tree = render();
  expect(tree.some((node) => node.type === 'button')).toBe(false);
  expect(get(tree, ContentCard).props.editing).toBe(false);
  expect(get(tree, ContentCard).props.onDelete).toBeUndefined();
});

it('편집 모드의 섹션을 누르면 수정 시트 대신 기존 사진 편집 페이지로 이동한다', () => {
  click(button(render(), '편집'));
  const tree = render();
  expect(get(tree, ContentCard).props.editing).toBe(true);
  (get(tree, ContentCard).props.onClick as () => void)();
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/contents/11');
  expect(get(render(), ContentEditSheet).props.open).toBe(false);
});

it('섹션 추가 저장 중 중복 제출을 막는다', () => {
  click(button(render(), '섹션 추가'));
  h.create.isPending = true;
  save(render());
  expect(h.create.mutate).not.toHaveBeenCalled();
  h.create.isPending = false;
  save(render());
  expect(h.create.mutate).toHaveBeenCalledWith(
    { name: '새 섹션', description: '소개' },
    expect.objectContaining({ onSuccess: expect.any(Function) }),
  );
});

it('마지막 섹션 삭제 성공 뒤 빈 목록에서 다시 추가할 수 있다', () => {
  click(button(render(), '편집'));
  (get(render(), ContentCard).props.onDelete as () => void)();
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

it('섹션 추가 실패 시 창을 유지하고 재시도·다시 열기에서 오류를 지운다', () => {
  const open = () => click(button(render(), '섹션 추가'));
  const mutation = h.create;
  open();
  save(render());
  mutation.mutate.mock.calls[0][1].onError(new Error('Network Error'));
  let sheet = get(render(), ContentEditSheet);
  expect(sheet.props.open).toBe(true);
  expect(sheet.props.errorMessage).toBe('네트워크 연결을 확인해주세요.');

  save(render());
  expect(get(render(), ContentEditSheet).props.errorMessage).toBeNull();
  mutation.mutate.mock.calls[1][1].onError(new Error('Network Error'));
  sheet = get(render(), ContentEditSheet);
  (sheet.props.onClose as () => void)();
  open();
  expect(get(render(), ContentEditSheet).props.errorMessage).toBeNull();
});

it('섹션 삭제 실패 시 목록과 확인 창을 유지하고 다시 열면 오류를 지운다', () => {
  (get(render(), ContentCard).props.onDelete as () => void)();
  (get(render(), ContentDeleteConfirmDialog).props.onConfirm as () => void)();
  h.remove.mutate.mock.calls[0][1].onError(new Error('Network Error'));
  const dialog = get(render(), ContentDeleteConfirmDialog);
  expect(dialog.props.open).toBe(true);
  expect(dialog.props.errorMessage).toBe('네트워크 연결을 확인해주세요.');
  expect(render().filter((node) => node.type === ContentCard)).toHaveLength(1);

  (dialog.props.onCancel as () => void)();
  (get(render(), ContentCard).props.onDelete as () => void)();
  expect(get(render(), ContentDeleteConfirmDialog).props.errorMessage).toBeNull();
});
