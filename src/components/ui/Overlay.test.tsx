import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { Overlay } from './Overlay';

const h = vi.hoisted(() => ({
  mounted: true,
  exiting: false,
  close: vi.fn(),
  focusTrap: vi.fn(),
  scrollLock: vi.fn(),
  history: vi.fn(),
}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useId: () => 'overlay',
  useRef: () => ({ current: null }),
  useEffect: () => {},
}));
vi.mock('react-dom', () => ({ createPortal: (children: ReactNode) => children }));
vi.mock('@/hooks/usePresence', () => ({
  usePresence: () => ({ isMounted: h.mounted, isExiting: h.exiting, onAnimationEnd: vi.fn() }),
}));
vi.mock('@/hooks/useOverlayHistory', () => ({ useOverlayHistory: h.history }));
vi.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: h.focusTrap }));
vi.mock('@/hooks/useScrollLock', () => ({ useScrollLock: h.scrollLock }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const classes = (node: Element) => (node.props.className as string).split(' ');
const panel = (tree: Element[]) => tree.find((node) => node.type === 'section')!;
const positioner = (tree: Element[]) =>
  tree.find(
    (node) => classes(node).includes('flex-1') && classes(node).includes('pointer-events-none'),
  )!;
const hasHandle = (tree: Element[]) =>
  tree.some(
    (node) => typeof node.props.className === 'string' && classes(node).includes('bg-tertiary'),
  );

beforeEach(() => {
  h.mounted = true;
  h.exiting = false;
  vi.clearAllMocks();
  h.history.mockReturnValue({ requestClose: h.close, isTopmost: () => true });
  vi.stubGlobal('document', { body: {} });
});
afterEach(() => vi.unstubAllGlobals());

it('기본 오버레이는 모바일 시트와 태블릿 중앙 모달을 그대로 유지한다', () => {
  const tree = nodes(Overlay({ open: true, onClose: vi.fn(), title: '기본' }));
  expect(classes(positioner(tree))).toEqual(
    expect.arrayContaining(['justify-end', 'tablet:justify-center', 'tablet:p-gutter']),
  );
  expect(classes(panel(tree))).toEqual(
    expect.arrayContaining([
      'rounded-t-20',
      'pb-safe-area-bottom',
      'tablet:max-w-120',
      'animate-sheet-in',
      'tablet:animate-modal-in',
    ]),
  );
  expect(hasHandle(tree)).toBe(true);
});

it('명시적 모달은 모든 화면에서 중앙 정렬하고 공통 닫기·포커스 동작을 재사용한다', () => {
  const onClose = vi.fn();
  const tree = nodes(
    Overlay({
      open: true,
      onClose,
      title: '삭제',
      size: 'sm',
      presentation: 'modal',
      className: 'max-w-80.5',
    }),
  );
  expect(classes(positioner(tree))).toEqual(
    expect.arrayContaining(['items-center', 'justify-center', 'p-gutter']),
  );
  expect(classes(panel(tree))).toEqual(
    expect.arrayContaining(['rounded-20', 'pb-5', 'shadow-lg', 'max-w-80.5', 'animate-modal-in']),
  );
  expect(classes(panel(tree))).not.toContain('max-w-80');
  expect(classes(panel(tree))).not.toContain('animate-sheet-in');
  expect(hasHandle(tree)).toBe(false);
  expect(h.history).toHaveBeenCalledWith(true, onClose);
  expect(h.scrollLock).toHaveBeenCalledWith(true);
  expect(h.focusTrap).toHaveBeenCalledWith(expect.any(Object), true, expect.any(Object));
  (tree.find((node) => node.props['aria-label'] === '닫기')!.props.onClick as () => void)();
  expect(h.close).toHaveBeenCalledOnce();
});

it.each([
  ['responsive', 'animate-sheet-out'],
  ['modal', 'animate-modal-out'],
] as const)('%s 닫힘 애니메이션을 선택하고 종료 후 제거한다', (presentation, animation) => {
  h.exiting = true;
  expect(
    classes(panel(nodes(Overlay({ open: false, onClose: vi.fn(), title: '닫힘', presentation })))),
  ).toContain(animation);
  h.mounted = false;
  expect(Overlay({ open: false, onClose: vi.fn(), title: '닫힘', presentation })).toBeNull();
});
