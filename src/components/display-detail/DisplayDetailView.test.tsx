import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';
import { DetailPreviewBanner, DetailTabNav } from '@/components/common/detail';

import { DisplayDetailView } from './DisplayDetailView';
import { IntroPanel } from './IntroPanel';
import { WorksPanel } from './WorksPanel';

const h = vi.hoisted(() => ({ activeTab: 'works', isStuck: true }));

vi.mock('@/components/common/detail', () => ({
  DetailPreviewBanner: () => null,
  DetailTabNav: () => null,
  DetailTopBar: () => null,
  detailStickyTopClass: () => '',
  useDetailTab: () => ({
    activeTab: h.activeTab,
    selectTab: vi.fn(),
    sentinelRef: { current: null },
    isStuck: h.isStuck,
  }),
}));
vi.mock('@/components/ui/Skeleton', () => ({ Skeleton: () => null, SkeletonText: () => null }));
vi.mock('./DisplayActions', () => ({
  DisplayBottomBar: () => null,
  DisplayInlineActions: () => null,
  DisplaySaveButton: () => null,
}));
vi.mock('./DisplaySummary', () => ({ DisplaySummary: () => null }));
vi.mock('./IntroPanel', () => ({ IntroPanel: () => null }));
vi.mock('./PosterCarousel', () => ({ PosterCarousel: () => null }));
vi.mock('./ReviewsPanel', () => ({ PreviewReviewsPanel: () => null, ReviewsPanel: () => null }));
vi.mock('./WorksPanel', () => ({ WorksPanel: () => null }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const find = (tree: Element[], type: unknown) => tree.find((node) => node.type === type);

const publicDisplay = {
  displayId: 7,
  title: '전시',
  status: 'PUBLISHED',
  images: [],
  teamMembers: [],
} as unknown as DisplayDetailDto;

beforeEach(() => {
  h.activeTab = 'works';
});

describe('전시 상세 미리보기 모드', () => {
  it('공개된 전시도 공개 전 띠를 두고, 탭 줄이 붙어도 뒤로가기 자리를 비우지 않는다', () => {
    const tree = nodes(DisplayDetailView({ display: publicDisplay, previewMode: true }));
    expect(find(tree, DetailPreviewBanner)).toBeDefined();
    expect(find(tree, DetailTabNav)?.props.isStuck).toBe(false);
  });

  it('작품 카드는 전시 미리보기에서 왔다는 표시와 함께 작품 미리보기 주소로 간다', () => {
    const tree = nodes(DisplayDetailView({ display: publicDisplay, previewMode: true }));
    const works = find(tree, WorksPanel);
    expect(works?.props.isPreview).toBe(true);
    const artworkPath = works?.props.artworkPath as (artworkId: number) => string;
    expect(artworkPath(3)).toBe('/exhibition/7/artworks/3/preview?from=ex');
  });

  it('소개 탭의 콘텐츠는 미리보기 안의 콘텐츠 주소로 간다', () => {
    h.activeTab = 'intro';
    const tree = nodes(DisplayDetailView({ display: publicDisplay, previewMode: true }));
    const contentPath = find(tree, IntroPanel)?.props.contentPath as (id: number) => string;
    expect(contentPath(5)).toBe('/exhibition/7/preview/contents?category=5');
  });

  it('공개 상세는 그대로 공개 작품 · 콘텐츠로 가고 띠가 없다', () => {
    const tree = nodes(DisplayDetailView({ display: publicDisplay }));
    expect(find(tree, DetailPreviewBanner)).toBeUndefined();
    // 뒤로가기 버튼이 없어 탭 줄이 붙어도 왼쪽 자리를 비우지 않는다
    expect(find(tree, DetailTabNav)?.props.isStuck).toBe(false);
    expect(find(tree, WorksPanel)?.props.artworkPath).toBeUndefined();
    expect(find(tree, IntroPanel)?.props.contentPath).toBeUndefined();
  });

  it('심사를 통과해 공개된 전시는 개막 전이어도 일반 상세로 보인다', () => {
    const upcoming = {
      ...publicDisplay,
      period: { startDate: '2999-01-01', endDate: '2999-01-02' },
    } as DisplayDetailDto;
    const tree = nodes(DisplayDetailView({ display: upcoming }));
    expect(find(tree, DetailPreviewBanner)).toBeUndefined();
    expect(find(tree, WorksPanel)?.props.isPreview).toBe(false);
  });

  it('등록 중 전시는 공개 상세 주소에서도 공개 전 모습이다', () => {
    const draft = { ...publicDisplay, status: 'DRAFT' } as DisplayDetailDto;
    const tree = nodes(DisplayDetailView({ display: draft }));
    expect(find(tree, DetailPreviewBanner)).toBeDefined();
  });
});
