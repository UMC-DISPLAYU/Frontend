import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/apiError';

import { BottomCommentBar } from './BottomCommentBar';
import { DrawingModal } from './DrawingModal';

const harness = vi.hoisted(() => ({
  states: [] as unknown[],
  refs: [] as { current: unknown }[],
  stateIndex: 0,
  refIndex: 0,
  clearImages: vi.fn(),
  uploadImages: vi.fn(),
  uploadImage: vi.fn(),
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useEffect: () => {},
  useState: (initial: unknown) => {
    const index = harness.stateIndex++;
    if (!(index in harness.states)) harness.states[index] = initial;
    return [
      harness.states[index],
      (value: unknown) => {
        harness.states[index] = typeof value === 'function' ? value(harness.states[index]) : value;
      },
    ];
  },
  useRef: (initial: unknown) => {
    const index = harness.refIndex++;
    return (harness.refs[index] ??= { current: initial });
  },
}));
vi.mock('@/stores/authStore', () => ({ useAuthStore: () => 'token' }));
vi.mock('./LoginConfirmModal', () => ({ LoginConfirmModal: () => null }));
vi.mock('@/utils/image', () => ({ readImageDimensions: async () => ({ width: 10, height: 20 }) }));
vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => ({
    images: [{ id: 'photo', file: {}, previewUrl: 'preview' }],
    clearImages: harness.clearImages,
    uploadImages: harness.uploadImages,
    uploadImage: harness.uploadImage,
    isUploading: false,
  }),
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const render = (onSubmit: () => Promise<void | boolean>) => {
  harness.stateIndex = 0;
  harness.refIndex = 0;
  const tree = nodes(BottomCommentBar({ onSubmit, imageDomain: 'test', showPrivateOption: true }));
  return (match: (node: Element) => boolean) => tree.find(match)!;
};
const byLabel = (label: string) => (node: Element) => node.props['aria-label'] === label;
const click = (node: Element) => (node.props.onClick as () => Promise<void>)();
const failure = new ApiError('server details', { status: 500 });

beforeEach(() => {
  harness.states = [];
  harness.refs = [];
  vi.clearAllMocks();
  harness.uploadImages.mockResolvedValue(['uploaded']);
  harness.uploadImage.mockResolvedValue('drawing');
});

it('저장 실패와 중복 클릭은 초안을 유지하고 성공한 재시도만 입력과 이미지를 비운다', async () => {
  let reject!: (error: Error) => void;
  const save = vi.fn(
    () =>
      new Promise<void>((_, fail) => {
        reject = fail;
      }),
  );
  let view = render(save);
  const input = view((node) => node.type === 'input' && 'placeholder' in node.props);
  (input.props.onChange as (event: { target: { value: string } }) => void)({
    target: { value: 'draft' },
  });
  await click(view((node) => 'aria-pressed' in node.props));
  view = render(save);
  const pending = click(view(byLabel('등록')));
  await click(view(byLabel('등록')));
  await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(harness.clearImages).not.toHaveBeenCalled();
  reject(failure);
  await pending;
  view = render(save);
  expect(view((node) => node.type === 'input' && 'placeholder' in node.props).props.value).toBe(
    'draft',
  );
  expect(view((node) => 'aria-pressed' in node.props).props['aria-pressed']).toBe(true);
  expect(view((node) => node.props.role === 'alert').props.children).toContain('서버');
  expect(harness.clearImages).not.toHaveBeenCalled();

  save.mockImplementation(async () => {});
  await click(view(byLabel('등록')));
  view = render(save);
  expect(harness.clearImages).toHaveBeenCalledTimes(1);
  expect(view((node) => node.type === 'input' && 'placeholder' in node.props).props.value).toBe('');
  expect(view((node) => 'aria-pressed' in node.props).props['aria-pressed']).toBe(false);
});

it('업로드 실패와 권한으로 중단된 저장도 이미지를 지우지 않는다', async () => {
  const save = vi.fn(async () => false);
  harness.uploadImages.mockRejectedValueOnce(failure);
  await click(render(save)(byLabel('등록')));
  expect(save).not.toHaveBeenCalled();
  await click(render(save)(byLabel('등록')));
  expect(save).toHaveBeenCalledTimes(1);
  expect(harness.clearImages).not.toHaveBeenCalled();
});

it('그림 저장 실패는 모달을 유지하고 성공할 때만 닫는다', async () => {
  const save = vi
    .fn<() => Promise<void>>()
    .mockRejectedValueOnce(failure)
    .mockResolvedValue(undefined);
  let view = render(save);
  await click(view(byLabel('첨부 메뉴 열기')));
  view = render(save);
  await click(
    view(
      (node) =>
        node.type === 'button' &&
        nodes(node.props.children as ReactNode).some((child) => child.props.children === '그리기'),
    ),
  );
  view = render(save);
  const submit = view((node) => node.type === DrawingModal).props.onSubmit as (
    file: File,
    dimensions: { width: number; height: number },
  ) => Promise<void>;
  await submit({} as File, { width: 10, height: 20 });
  view = render(save);
  expect(view((node) => node.type === DrawingModal).props.isOpen).toBe(true);
  expect(view((node) => node.type === DrawingModal).props.error).toContain('서버');
  expect(harness.clearImages).not.toHaveBeenCalled();
  await submit({} as File, { width: 10, height: 20 });
  expect(render(save)((node) => node.type === DrawingModal).props.isOpen).toBe(false);
  expect(harness.clearImages).toHaveBeenCalledTimes(1);
});
