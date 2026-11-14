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

const render = (props: { isPreview?: boolean; hideBack?: boolean }) =>
  nodes(
    ArtworkDetailShell({
      images: ['a.jpg'],
      title: '작품',
      onBack: vi.fn(),
      label: null,
      hasIntro: false,
      intro: null,
      guestbook: null,
      bottomBar: null,
      ...props,
    }),
  );

describe('작품 상세 뒤로가기', () => {
  it('작품 미리보기는 모바일 · 데스크톱 모두 뒤로가기 버튼을 두지 않는다', () => {
    const tree = render({ isPreview: true, hideBack: true });
    expect(tree.find((node) => node.type === DetailBackButton)).toBeUndefined();
    expect(tree.find((node) => node.type === ArtworkViewer)?.props.isPreview).toBe(false);
    expect(tree.find((node) => node.type === DetailTabNav)?.props.isStuck).toBe(false);
  });

  it('공개 전 전시의 공개 작품 상세는 모바일 · 데스크톱 뒤로가기를 그대로 둔다', () => {
    const tree = render({ isPreview: true });
    expect(tree.find((node) => node.type === DetailBackButton)).toBeDefined();
    expect(tree.find((node) => node.type === DetailTabNav)?.props.isStuck).toBe(true);
    expect(tree.find((node) => node.type === ArtworkViewer)?.props.isPreview).toBe(true);
  });

  it('공개 작품 상세는 모바일 뒤로가기만 둔다', () => {
    const tree = render({});
    expect(tree.find((node) => node.type === DetailBackButton)).toBeDefined();
    expect(tree.find((node) => node.type === ArtworkViewer)?.props.isPreview).toBe(false);
  });
});
