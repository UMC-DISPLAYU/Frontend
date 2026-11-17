import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { DetailBackButton, DetailTabNav } from '@/components/common/detail';

import { ArtworkDetailShell } from './ArtworkDetailShell';
import { ArtworkViewer } from './ArtworkViewer';

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useRef: () => ({ current: null }),
}));
vi.mock('@/components/common/detail', () => ({
  DetailBackButton: () => null,
  DetailPreviewBanner: () => null,
  DetailTabNav: () => null,
  DetailTopBar: () => null,
  detailStickyTopClass: () => '',
  useDetailTab: () => ({
    activeTab: 'guestbook',
    selectTab: vi.fn(),
    sentinelRef: { current: null },
    isStuck: true,
  }),
}));
vi.mock('@/components/ui/Skeleton', () => ({ Skeleton: () => null, SkeletonText: () => null }));
vi.mock('./ArtworkViewer', () => ({ ArtworkViewer: () => null }));
vi.mock('./useDisablePageBounce', () => ({ useDisablePageBounce: () => {} }));
vi.mock('./useViewMode', () => ({ useViewMode: () => ['stack', vi.fn()] }));
vi.mock('./useViewerChromeFade', () => ({
  useViewerChromeFade: () => ({ isStackHidden: false, holdProps: {} }),
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );

const render = (props: { isPreview?: boolean }) =>
  nodes(
    ArtworkDetailShell({
      images: ['a.jpg'],
      title: '작품',
      label: null,
      hasIntro: false,
      intro: null,
      guestbook: null,
      bottomBar: null,
      ...props,
    }),
  );

describe('작품 상세 뒤로가기', () => {
  it.each([
    ['공개 작품 상세', false],
    ['미리보기', true],
  ])(
    '%s는 모바일 · 데스크톱 모두 뒤로가기 버튼을 두지 않는다(프로토타입 U-149)',
    (_, isPreview) => {
      const tree = render({ isPreview });
      expect(tree.find((node) => node.type === DetailBackButton)).toBeUndefined();
      expect(tree.find((node) => node.type === ArtworkViewer)?.props).not.toHaveProperty('onBack');
      // 뒤로가기 자리를 비우지 않으므로 탭 줄이 붙어도 왼쪽으로 밀지 않는다
      expect(tree.find((node) => node.type === DetailTabNav)?.props.isStuck).toBe(false);
    },
  );
});
