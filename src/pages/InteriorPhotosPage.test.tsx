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
  reorderPending: false,
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
  useReorderContentImages: () => ({ mutate: h.reorder, isPending: h.reorderPending }),
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
const textContent = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) =>
      isValidElement<Record<string, unknown>>(child)
        ? textContent(child.props.children as ReactNode)
        : String(child),
    )
    .join('');
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
const drag = (activeId: string, overId: string | null, tree = render()) => {
  (tree.find((node) => 'onDragEnd' in node.props)!.props.onDragEnd as (event: unknown) => void)({
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  });
};
const alertText = () =>
  render()
    .filter((node) => node.props.role === 'alert')
    .map(textContent)
    .join('\n');
const selectFiles = (files: { name: string; type: string; size: number }[]) => {
  const input = render().find((node) => node.props.type === 'file')!;
  return (input.props.onChange as (event: unknown) => Promise<void>)({ target: { files } });
};
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
  h.reorderPending = false;
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

it('순서 변경은 즉시 한 번 저장하고 완료는 편집 모드만 닫는다', () => {
  click(render(), '편집');
  click(render(), '완료');
  expect(h.reorder).not.toHaveBeenCalled();

  click(render(), '편집');
  drag('3', '1');
  expect(photoIds()).toEqual([3, 1, 2]);
  expect(h.reorder).toHaveBeenCalledTimes(1);
  expect(h.reorder).toHaveBeenCalledWith([3, 1, 2], expect.any(Object));
  h.reorder.mock.calls[0][1].onSuccess();
  expect(photos(render()).every((node) => node.props.isEditing === true)).toBe(true);

  click(render(), '완료');
  expect(h.reorder).toHaveBeenCalledTimes(1);
  expect(photos(render()).every((node) => node.props.isEditing === false)).toBe(true);
});

it('저장 실패는 직전 저장 순서로 복구하고 편집을 유지해 다시 이동할 수 있다', () => {
  click(render(), '편집');
  drag('3', '1');
  h.reorder.mock.calls[0][1].onSuccess();
  drag('2', '3');
  expect(photoIds()).toEqual([2, 3, 1]);
  expect(h.reorder).toHaveBeenLastCalledWith([2, 3, 1], expect.any(Object));

  h.reorder.mock.calls[1][1].onError(failure);
  expect(photoIds()).toEqual([3, 1, 2]);
  expect(photos(render()).every((node) => node.props.isEditing === true)).toBe(true);
  expect(alertText()).toContain('서버');

  drag('2', '3');
  expect(h.reorder).toHaveBeenCalledTimes(3);
  expect(h.reorder).toHaveBeenLastCalledWith([2, 3, 1], expect.any(Object));
});

it('저장 중 연속 드래그와 완료는 무시하고 저장이 끝나면 다음 순서를 저장한다', () => {
  click(render(), '편집');
  const tree = render();
  drag('3', '1', tree);
  drag('2', '1', tree);
  expect(h.reorder).toHaveBeenCalledTimes(1);
  expect(photoIds()).toEqual([3, 1, 2]);

  h.reorderPending = true;
  drag('1', '3');
  const pendingTree = render();
  const done = pendingTree.find(
    (node) => node.type === 'button' && node.props.children === '저장 중',
  )!;
  expect(done.props.disabled).toBe(true);
  click(pendingTree, '저장 중');
  expect(
    photos(render()).every((node) => node.props.isEditing === true && node.props.disabled === true),
  ).toBe(true);
  expect(photoIds()).toEqual([3, 1, 2]);
  expect(h.reorder).toHaveBeenCalledTimes(1);

  h.reorder.mock.calls[0][1].onSuccess();
  h.reorderPending = false;
  drag('1', '3');
  expect(photoIds()).toEqual([1, 3, 2]);
  expect(h.reorder).toHaveBeenCalledTimes(2);
  expect(h.reorder).toHaveBeenLastCalledWith([1, 3, 2], expect.any(Object));
});

it.each([
  { label: '편집 모드가 아님', editing: false, active: '3', over: '1' },
  { label: '동일 사진', editing: true, active: '1', over: '1' },
  { label: '놓은 대상 없음', editing: true, active: '1', over: null },
  { label: '이동할 사진 없음', editing: true, active: 'missing', over: '1' },
  { label: '놓은 사진 없음', editing: true, active: '1', over: 'missing' },
])('$label: 순서를 바꾸거나 저장하지 않는다', ({ editing, active, over }) => {
  if (editing) click(render(), '편집');
  drag(active, over);
  expect(photoIds()).toEqual([1, 2, 3]);
  expect(h.reorder).not.toHaveBeenCalled();
});

it('삭제한 사진은 즉시 순서 저장에 실패해도 되살리지 않는다', () => {
  click(render(), '편집');
  remove(2);
  h.remove.mock.calls[0][1].onSuccess();
  drag('3', '1');
  expect(photoIds()).toEqual([3, 1]);
  expect(h.reorder).toHaveBeenCalledTimes(1);
  expect(h.reorder.mock.calls[0][0]).toEqual([3, 1]);
  h.reorder.mock.calls[0][1].onError(failure);
  expect(photoIds()).toEqual([1, 3]);
  expect(photos(render()).every((node) => node.props.isEditing === true)).toBe(true);
  expect(render().some((node) => node.props.role === 'alert')).toBe(true);
});

it('팀원은 자기 사진만 삭제하고 완료 시 순서 API를 호출하지 않는다', () => {
  h.user = { id: 2, isArtistVerified: false };
  let tree = render();
  expect(tree.find((node) => node.props.id === 'section-name')!.props.readOnly).toBe(true);
  click(tree, '편집');
  drag('3', '1');
  expect(photoIds()).toEqual([1, 2, 3]);
  expect(h.reorder).not.toHaveBeenCalled();
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
    { name: 'one.png', type: 'image/png', size: 1024 },
    { name: 'two.png', type: 'image/png', size: 1024 },
  ];
  await (input.props.onChange as (event: unknown) => Promise<void>)({ target: { files } });
  expect(h.addImages).toHaveBeenCalledWith([files[0]]);
  expect(h.create).toHaveBeenCalledWith({ imageUrl: '/new-photo.jpg', width: 800, height: 600 });
  expect(photoIds()).toHaveLength(20);
});

it('기존 네 이미지 형식과 20MB 이하를 허용하고 초과·미지원 형식은 한 장씩 집계한다', async () => {
  const maxBytes = 20 * 1024 * 1024;
  const validFiles = [
    { name: 'boundary.jpg', type: 'image/jpeg', size: maxBytes },
    { name: 'under.png', type: 'image/png', size: maxBytes - 1 },
    { name: 'small.webp', type: 'image/webp', size: 1024 },
    { name: 'small.gif', type: 'image/gif', size: 1024 },
  ];
  await selectFiles([
    ...validFiles,
    { name: 'over.png', type: 'image/png', size: maxBytes + 1 },
    { name: 'vector.svg', type: 'image/svg+xml', size: maxBytes + 1 },
    { name: 'unknown.jpg', type: '', size: 1024 },
  ]);
  expect(h.addImages).toHaveBeenCalledWith(validFiles);
  expect(h.upload).toHaveBeenCalledTimes(4);
  expect(h.create).toHaveBeenCalledTimes(4);
  expect(alertText()).toContain('3장은 올리지 못했어요');
  expect(alertText()).toContain('지원하지 않는 형식이거나 20MB를 넘는 파일이에요');
});

it('전부 잘못된 파일이면 요청하지 않고 다음 정상 선택에서 이전 안내를 지운다', async () => {
  await selectFiles([
    { name: 'unsupported.heic', type: 'image/heic', size: 1024 },
    { name: 'too-large.jpg', type: 'image/jpeg', size: 20 * 1024 * 1024 + 1 },
  ]);
  expect(h.addImages).not.toHaveBeenCalled();
  expect(h.upload).not.toHaveBeenCalled();
  expect(h.create).not.toHaveBeenCalled();
  expect(alertText()).toContain('2장은 올리지 못했어요');
  await selectFiles([{ name: 'valid.jpg', type: 'image/jpeg', size: 1024 }]);
  expect(h.create).toHaveBeenCalledTimes(1);
  expect(alertText()).toBe('');
});

it('지원하지 않는 파일이 남은 사진 한 칸을 차지하지 않는다', async () => {
  h.contents = Array.from({ length: 19 }, (_, index) => ({
    contentId: index + 1,
    imageUrl: `/photo-${index}.jpg`,
    userId: 1,
  }));
  const validFile = { name: 'valid.jpg', type: 'image/jpeg', size: 1024 };
  await selectFiles([
    { name: 'unsupported.heic', type: 'image/heic', size: 1024 },
    validFile,
    { name: 'over-count.jpg', type: 'image/jpeg', size: 1024 },
  ]);
  expect(h.addImages).toHaveBeenCalledWith([validFile]);
  expect(photoIds()).toHaveLength(20);
  expect(alertText()).toContain('1장은 올리지 못했어요');
});

it('업로드와 등록의 부분 실패를 집계하면서 성공한 사진을 선택 순서대로 남긴다', async () => {
  const networkError = new ApiError('network', { transportCode: 'ERR_NETWORK' });
  h.upload.mockImplementation(async (file: File) => {
    if (file.name === 'upload-fail.png') throw networkError;
    return `/${file.name}`;
  });
  h.create.mockImplementation(async ({ imageUrl }: { imageUrl: string }) => {
    if (imageUrl === '/create-fail.png') throw failure;
    return { contentId: imageUrl === '/first.png' ? 11 : 14 };
  });
  await selectFiles(
    ['first.png', 'upload-fail.png', 'create-fail.png', 'last.png'].map((name) => ({
      name,
      type: 'image/png',
      size: 1024,
    })),
  );
  expect(h.upload).toHaveBeenCalledTimes(4);
  expect(h.create).toHaveBeenCalledTimes(3);
  expect(photoIds()).toEqual([1, 2, 3, 11, 14]);
  expect(alertText()).toContain('2장은 올리지 못했어요');
  expect(alertText()).toContain('네트워크 연결을 확인해주세요.');
  expect(alertText()).not.toContain('지원하지 않는 형식');
});

it('한 요청이 먼저 실패해도 모든 파일 처리가 끝날 때까지 중복 업로드를 막는다', async () => {
  let finishUpload!: (url: string) => void;
  h.upload.mockRejectedValueOnce(failure).mockImplementationOnce(
    () =>
      new Promise<string>((resolve) => {
        finishUpload = resolve;
      }),
  );
  const pending = selectFiles([
    { name: 'fail.png', type: 'image/png', size: 1024 },
    { name: 'pending.png', type: 'image/png', size: 1024 },
  ]);
  await Promise.resolve();
  await selectFiles([{ name: 'duplicate.png', type: 'image/png', size: 1024 }]);
  expect(h.upload).toHaveBeenCalledTimes(2);
  const uploadButton = render().find(
    (node) => node.type === 'button' && textContent(node).includes('업로드 중'),
  );
  expect(uploadButton?.props.disabled).toBe(true);
  finishUpload('/pending.png');
  await pending;
  expect(photoIds()).toEqual([1, 2, 3, 21]);
  expect(
    render().some((node) => node.type === 'button' && textContent(node).includes('업로드 중')),
  ).toBe(false);
});
