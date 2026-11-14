import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';

import { SectionCreatePage } from './SectionCreatePage';

const h = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  si: 0,
  ri: 0,
  title: '',
  categoryCount: 2,
  navigate: vi.fn(),
  upload: vi.fn(),
  create: vi.fn(),
  toast: vi.fn(),
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
  useEffect: vi.fn(),
}));
vi.mock('react-hook-form', () => ({
  useForm: () => ({ register: () => ({}), control: {}, formState: { errors: {} } }),
  useWatch: () => h.title,
}));
vi.mock('react-router-dom', () => ({
  Navigate: 'Navigate',
  useNavigate: () => h.navigate,
  useParams: () => ({ displayId: '7' }),
}));
vi.mock('@/components/artworks-manage', async () => ({
  ...(await import('@/components/artworks-manage/contentEdit.schema')),
  ...(await import('@/components/artworks-manage/constants')),
  ...(await import('@/components/artworks-manage/useLiveSort')),
  ...(await import('@/components/artworks-manage/SectionPhotos')),
  ...(await import('@/components/artworks-manage/sectionPhotos.constants')),
  SectionFieldLabel: () => null,
  sectionInputClass: '',
}));
vi.mock('@/components/common', () => ({ ErrorView: () => null, LoadingView: () => null }));
vi.mock('@/components/common/OptimizedImage', () => ({ OptimizedImage: () => null }));
vi.mock('@/components/exhibition-work', () => ({ WorkBar: () => null, WorkIcon: () => null }));
vi.mock('@/components/layout', () => ({ PageContainer: () => null }));
vi.mock('@/components/ui', () => ({ Overlay: () => null }));
vi.mock('@/hooks/queries/useDisplayDetail', () => ({
  useDisplayDetail: () => ({
    isPending: false,
    isError: false,
    data: {
      displayId: 7,
      contentCategories: Array.from({ length: h.categoryCount }, (_, i) => ({ categoryId: i })),
    },
  }),
}));
vi.mock('@/hooks/queries/useContentCategories', () => ({
  useCreateSectionWithPhotos: () => ({ mutateAsync: h.create }),
}));
vi.mock('@/hooks/useImageUpload', () => ({ useImageUpload: () => ({ uploadImage: h.upload }) }));
vi.mock('@/stores/toastStore', () => ({ toast: h.toast }));

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
  const page = SectionCreatePage() as Element;
  if (typeof page.type === 'string') return [page];
  return nodes((page.type as (props: unknown) => ReactNode)(page.props));
};
const submitButton = () =>
  render().find(
    (node) =>
      node.type === 'button' && ['추가하기', '추가하는 중'].includes(String(node.props.children)),
  )!;
const pick = (files: { name: string; type: string; size: number }[]) =>
  (render().find((node) => node.props.type === 'file')!.props.onChange as (e: unknown) => void)({
    target: { files, value: 'x' },
  });
const photo = (name: string) => ({ name, type: 'image/png', size: 1024 });

beforeEach(() => {
  h.states = [];
  h.refs = [];
  h.title = '';
  h.categoryCount = 2;
  vi.clearAllMocks();
  let n = 0;
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => `blob:${(n += 1)}`),
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal('window', { history: { state: { idx: 3 } } });
  h.upload.mockImplementation(async (file: { name: string }) => `/up/${file.name}`);
  h.create.mockResolvedValue({ categoryId: 31, failedCount: 0 });
});
afterEach(() => vi.unstubAllGlobals());

it('제목과 사진 1장 이상이 있어야 추가하기를 누를 수 있다(프로토타입 11-15)', () => {
  expect(submitButton().props.disabled).toBe(true);
  h.title = '전시 전경';
  expect(submitButton().props.disabled).toBe(true);
  h.title = '';
  pick([photo('a.png')]);
  expect(submitButton().props.disabled).toBe(true);
  h.title = '전시 전경';
  expect(submitButton().props.disabled).toBe(false);
});

it('추가하기는 고른 순서대로 사진을 올린 뒤 섹션을 만들고 전시 콘텐츠로 돌아간다', async () => {
  h.title = ' 전시 전경 ';
  pick([photo('a.png'), photo('b.png')]);
  await (submitButton().props.onClick as () => Promise<void>)();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(h.create).toHaveBeenCalledWith({
    title: '전시 전경',
    imageUrls: ['/up/a.png', '/up/b.png'],
  });
  expect(h.toast).toHaveBeenCalledWith('섹션을 추가했어요');
  expect(h.navigate).toHaveBeenCalledWith(-1);
});

it('사진 일부를 붙이지 못하면 만들어진 섹션의 편집 화면으로 보낸다', async () => {
  h.title = '전시 전경';
  h.create.mockResolvedValue({ categoryId: 31, failedCount: 1 });
  pick([photo('a.png'), photo('b.png')]);
  await (submitButton().props.onClick as () => Promise<void>)();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(h.navigate).toHaveBeenCalledWith('/exhibition/7/contents/31', { replace: true });
});

it('올리기에 실패하면 화면에 남아 다시 시도할 수 있다', async () => {
  h.title = '전시 전경';
  h.upload.mockRejectedValue(new ApiError('server', { status: 500 }));
  pick([photo('a.png')]);
  await (submitButton().props.onClick as () => Promise<void>)();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(h.create).not.toHaveBeenCalled();
  expect(h.navigate).not.toHaveBeenCalled();
  expect(submitButton().props.disabled).toBe(false);
  const note = render().find((node) => 'rejectedCount' in node.props)!;
  expect(String(note.props.message)).toContain('서버');
});

it('입력한 게 있으면 뒤로가기 때 나갈지 묻고, 없으면 바로 나간다', () => {
  const back = () =>
    (render().find((node) => 'onBack' in node.props)!.props.onBack as () => void)();
  back();
  expect(h.navigate).toHaveBeenCalledWith(-1);
  h.navigate.mockClear();
  h.title = '전시 전경';
  back();
  expect(h.navigate).not.toHaveBeenCalled();
  const dialog = render().find((node) => node.props.title === '섹션 추가를 나갈까요?')!;
  expect(dialog.props.open).toBe(true);
});

it('마지막 한 장은 지울 수 없다', () => {
  pick([photo('a.png')]);
  const tile = render().find((node) => 'canDelete' in node.props)!;
  expect(tile.props.canDelete).toBe(false);
});

it('섹션이 5개면 섹션 추가 화면 대신 전시 콘텐츠로 보낸다', () => {
  h.categoryCount = 5;
  const [redirect] = render();
  expect(redirect.type).toBe('Navigate');
  expect(redirect.props.to).toBe('/exhibition/7/work?tab=contents');
});
