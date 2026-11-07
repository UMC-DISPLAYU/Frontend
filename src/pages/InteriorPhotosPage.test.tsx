import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';

import { InteriorPhotosPage } from './InteriorPhotosPage';

const h = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  si: 0,
  ri: 0,
  user: { id: 1, isArtistVerified: true },
  contents: [] as { contentId: number; imageUrl: string; userId: number }[],
  save: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
  create: vi.fn(),
  upload: vi.fn(),
  addImages: vi.fn(),
  reset: vi.fn(),
  setError: vi.fn(),
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => {
    const i = h.si++;
    if (!(i in h.states)) h.states[i] = initial;
    return [
      h.states[i],
      (value: unknown) => {
        h.states[i] = typeof value === 'function' ? value(h.states[i]) : value;
      },
    ];
  },
  useRef: (initial: unknown) => h.refs[h.ri++] ?? (h.refs[h.ri - 1] = { current: initial }),
}));
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: () => ({}),
    handleSubmit: (handler: unknown) => handler,
    control: {},
    reset: h.reset,
    setError: h.setError,
    formState: { errors: {}, isDirty: true, isSubmitting: false },
  }),
  useWatch: () => '섹션 설명',
}));
vi.mock('react-router-dom', () => ({ useParams: () => ({ displayId: '7', categoryId: '9' }) }));
vi.mock('@dnd-kit/core', () => ({
  DndContext: () => null,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensors: vi.fn(),
  useSensor: vi.fn(),
}));
vi.mock('@dnd-kit/sortable', async (original) => ({
  ...(await original<typeof import('@dnd-kit/sortable')>()),
  SortableContext: () => null,
  useSortable: () => ({ attributes: {}, listeners: {} }),
}));
vi.mock(
  '@/components/artworks-manage',
  async () => import('@/components/artworks-manage/contentEdit.schema'),
);
vi.mock('@/components/common', () => ({ BottomFixedBar: () => null, ErrorView: () => null }));
vi.mock('@/components/common/OptimizedImage', () => ({ OptimizedImage: () => null }));
vi.mock('@/components/exhibition-work', () => ({ WorkHeader: () => null }));
vi.mock('@/components/layout', () => ({ PageContainer: () => null, useHideFooter: vi.fn() }));
vi.mock('@/components/ui', () => ({ Skeleton: () => null, SkeletonList: () => null }));
vi.mock('@/hooks/useFlowBack', () => ({ useFlowBack: () => vi.fn() }));
vi.mock('@/hooks/usePolicy', async () => {
  const { policies } = await import('@/policies/policies');
  return {
    useCurrentPolicyUser: () => h.user,
    useDisplayContentPolicy: (
      display: Parameters<typeof policies.displayContent.reorder>[1],
      photo?: { userId: number },
    ) => ({
      editCategory: () => policies.displayContent.editCategory(h.user, display),
      createContent: () => policies.displayContent.createContent(h.user, display),
      deleteContent: () => policies.displayContent.deleteContent(h.user, display, photo),
      reorder: () => policies.displayContent.reorder(h.user, display),
    }),
  };
});
vi.mock('@/hooks/queries/useDisplayDetail', () => ({
  useDisplayDetail: () => ({
    isPending: false,
    data: {
      displayId: 7,
      ownerUserId: 1,
      teamMembers: [{ userId: 2, accepted: true }],
      contentCategories: [
        { categoryId: 9, name: '전시 전경', description: '섹션 설명', contents: h.contents },
      ],
    },
  }),
}));
vi.mock('@/hooks/queries/useContentCategories', () => ({
  useUpdateContentCategory: () => ({ mutateAsync: h.save, isPending: false }),
}));
vi.mock('@/hooks/queries/useContentImages', () => ({
  useCreateContentImage: () => ({ mutateAsync: h.create, isPending: false }),
  useDeleteContentImage: () => ({ mutate: h.remove, isPending: false }),
  useReorderContentImages: () => ({ mutate: h.reorder, isPending: false }),
}));
vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    isUploading: false,
    addImages: h.addImages,
    uploadImage: h.upload,
    clearImages: vi.fn(),
  }),
}));
vi.mock('@/stores/toastStore', () => ({ toast: vi.fn() }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const render = () => {
  h.si = 0;
  h.ri = 0;
  const page = InteriorPhotosPage();
  return nodes((page.type as (props: unknown) => ReactNode)(page.props));
};
const click = (tree: Element[], label: string) => {
  const button = tree.find((node) => node.type === 'button' && node.props.children === label)!;
  (button.props.onClick as () => void)();
};
const photos = (tree: Element[]) => tree.filter((node) => 'photo' in node.props);
const photoIds = () => photos(render()).map((node) => (node.props.photo as { id: number }).id);
const remove = (id: number) => {
  const photo = photos(render()).find((node) => (node.props.photo as { id: number }).id === id)!;
  (photo.props.onRemove as (id: number) => void)(id);
};
const submit = (tree: Element[]) =>
  tree.find((node) => node.type === 'form')!.props.onSubmit as (values: {
    title: string;
    description: string;
  }) => Promise<void>;
const failure = new ApiError('server', { status: 500 });

beforeEach(() => {
  h.states = [];
  h.refs = [];
  h.user = { id: 1, isArtistVerified: true };
  h.contents = [1, 2, 3].map((id) => ({
    contentId: id,
    imageUrl: `/photo-${id}.jpg`,
    userId: id === 2 ? 2 : 1,
  }));
  vi.clearAllMocks();
  h.save.mockResolvedValue(undefined);
  h.upload.mockResolvedValue('/new-photo.jpg');
  h.create.mockResolvedValue({ contentId: 21 });
  h.addImages.mockImplementation((files: File[]) => files.map((file) => ({ file })));
});

it('삭제한 사진은 순서 저장에 실패해도 되살리지 않고 나머지 순서를 복구한다', () => {
  click(render(), '편집');
  remove(2);
  h.remove.mock.calls[0][1].onSuccess();
  const tree = render();
  (tree.find((node) => 'onDragEnd' in node.props)!.props.onDragEnd as (event: unknown) => void)({
    active: { id: '3' },
    over: { id: '1' },
  });
  expect(photoIds()).toEqual([3, 1]);
  click(render(), '완료');
  expect(h.reorder.mock.calls[0][0]).toEqual([3, 1]);
  h.reorder.mock.calls[0][1].onError(failure);
  expect(photoIds()).toEqual([1, 3]);
  expect(render().some((node) => node.props.role === 'alert')).toBe(true);
});

it('팀원은 자기 사진만 삭제하고 완료 시 순서 API를 호출하지 않는다', () => {
  h.user = { id: 2, isArtistVerified: false };
  let tree = render();
  expect(tree.find((node) => node.props.id === 'section-name')!.props.readOnly).toBe(true);
  click(tree, '편집');
  remove(1);
  expect(h.remove).not.toHaveBeenCalled();
  remove(2);
  expect(h.remove).toHaveBeenCalledWith(2, expect.any(Object));
  h.remove.mock.calls[0][1].onSuccess();
  click(render(), '완료');
  expect(h.reorder).not.toHaveBeenCalled();
  tree = render();
  expect(photos(tree).every((node) => node.props.isEditing === false)).toBe(true);
});

it('사진 삭제 실패는 사진을 복원하며 마지막 사진 삭제 후 빈 순서는 저장하지 않는다', () => {
  h.contents = h.contents.slice(0, 1);
  click(render(), '편집');
  remove(1);
  h.remove.mock.calls[0][1].onError(failure);
  expect(photoIds()).toEqual([1]);
  remove(1);
  h.remove.mock.calls[1][1].onSuccess();
  click(render(), '완료');
  expect(photoIds()).toEqual([]);
  expect(h.reorder).not.toHaveBeenCalled();
});

it('섹션 정보 실패는 초안을 유지하고 중복 저장을 막으며 성공 후에만 기준값을 갱신한다', async () => {
  let reject!: (error: Error) => void;
  h.save.mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  const values = { title: '새 제목', description: '새 설명' };
  const save = submit(render());
  const pending = save(values);
  await save(values);
  expect(h.save).toHaveBeenCalledTimes(1);
  reject(failure);
  await pending;
  expect(h.reset).not.toHaveBeenCalled();
  expect(h.setError).toHaveBeenCalledWith(
    'root',
    expect.objectContaining({ message: expect.stringContaining('서버') }),
  );
  await submit(render())(values);
  expect(h.save).toHaveBeenLastCalledWith({
    categoryId: 9,
    body: { name: values.title, description: values.description },
  });
  expect(h.reset).toHaveBeenCalledWith(values);
});

it('섹션 편집 권한이 없으면 제출해도 저장하지 않는다', async () => {
  h.user = { id: 2, isArtistVerified: false };
  await submit(render())({ title: '새 제목', description: '새 설명' });
  expect(h.save).not.toHaveBeenCalled();
});

it('사진 20장 상한과 기존 업로드 요청을 유지한다', async () => {
  h.contents = Array.from({ length: 19 }, (_, index) => ({
    contentId: index + 1,
    imageUrl: `/photo-${index}.jpg`,
    userId: 1,
  }));
  const input = render().find((node) => node.props.type === 'file')!;
  expect(input.props.accept).toBe('image/jpeg,image/png,image/webp,image/gif');
  const files = [
    { name: 'one.png', type: 'image/png' },
    { name: 'two.png', type: 'image/png' },
  ];
  await (input.props.onChange as (event: unknown) => Promise<void>)({ target: { files } });
  expect(h.addImages).toHaveBeenCalledWith([files[0]]);
  expect(h.create).toHaveBeenCalledWith({ imageUrl: '/new-photo.jpg', width: 800, height: 600 });
  expect(photoIds()).toHaveLength(20);
});
