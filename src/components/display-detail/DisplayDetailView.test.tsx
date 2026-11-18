import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';
import { DetailPreviewBanner, DetailTabNav } from '@/components/common/detail';

import { DisplayDetailView } from './DisplayDetailView';
import { IntroPanel } from './IntroPanel';
import { WorksPanel } from './WorksPanel';

const h = vi.hoisted(() => ({
  activeTab: 'works',
  isStuck: true,
  tabs: [] as readonly string[],
  works: { data: { artworks: [{ artworkId: 1 }] } as unknown },
}));

vi.mock('@/components/common/detail', () => ({
  DetailPreviewBanner: () => null,
  DetailTabNav: () => null,
  DetailTopBar: () => null,
  detailStickyTopClass: () => '',
  useDetailTab: (tabs: readonly string[]) => {
    h.tabs = tabs;
    return {
      activeTab: h.activeTab,
      selectTab: vi.fn(),
      sentinelRef: { current: null },
      isStuck: h.isStuck,
    };
  },
}));
vi.mock('@/hooks/queries/useDisplayArtworks', () => ({ useDisplayArtworks: () => h.works }));
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
  content: '전시 소개',
  images: [],
  teamMembers: [],
  contentCategories: [],
} as unknown as DisplayDetailDto;
const introPanel = (tree: Element[]) =>
  tree.find((node) => node.props.id === 'display-panel-intro');

beforeEach(() => {
  h.activeTab = 'works';
  h.works = { data: { artworks: [{ artworkId: 1 }] } };
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

  it('공개 전 모습은 미리보기 모드에서만 보인다(등록 중 전시도 미리보기 주소로 보내므로 여기서 따로 보지 않는다)', () => {
    const draft = { ...publicDisplay, status: 'DRAFT' } as DisplayDetailDto;
    const tree = nodes(DisplayDetailView({ display: draft }));
    expect(find(tree, DetailPreviewBanner)).toBeUndefined();
    expect(find(tree, WorksPanel)?.props.isPreview).toBe(false);
  });
});

describe('전시 상세 소개 탭', () => {
  const emptyIntro = { ...publicDisplay, content: '  ', contentCategories: [] } as DisplayDetailDto;

  it.each([
    ['공개 상세', false],
    ['미리보기', true],
  ])('%s에서 소개 글 · 콘텐츠가 모두 없으면 소개 탭과 패널을 뺀다', (_, previewMode) => {
    h.activeTab = 'works';
    const tree = nodes(DisplayDetailView({ display: emptyIntro, previewMode }));
    expect(h.tabs).toEqual(['works', 'reviews']);
    expect(find(tree, DetailTabNav)?.props.tabs).toEqual(['works', 'reviews']);
    expect(introPanel(tree)).toBeUndefined();
    expect(find(tree, IntroPanel)).toBeUndefined();
    expect(find(tree, WorksPanel)).toBeDefined();
  });

  it('소개 글만 있거나 콘텐츠만 있으면 소개 탭을 처음에 둔다', () => {
    h.activeTab = 'intro';
    const withContents = {
      ...publicDisplay,
      content: null,
      contentCategories: [{ categoryId: 1, name: '도록', contents: [] }],
    } as unknown as DisplayDetailDto;
    for (const display of [publicDisplay, withContents]) {
      const tree = nodes(DisplayDetailView({ display }));
      expect(find(tree, DetailTabNav)?.props.tabs).toEqual(['intro', 'works', 'reviews']);
      expect(introPanel(tree)?.props.hidden).toBe(false);
      expect(find(tree, IntroPanel)).toBeDefined();
    }
  });
});

describe('전시 상세 작품 탭', () => {
  const worksPanel = (tree: Element[]) =>
    tree.find((node) => node.props.id === 'display-panel-works');

  it.each([
    ['공개 상세', false],
    ['미리보기', true],
  ])('%s에서 받은 작품 목록이 비면(작품 공개 전 포함) 작품 탭과 패널을 뺀다', (_, previewMode) => {
    h.works = { data: { artworks: [] } };
    h.activeTab = 'intro';
    const tree = nodes(DisplayDetailView({ display: publicDisplay, previewMode }));
    expect(find(tree, DetailTabNav)?.props.tabs).toEqual(['intro', 'reviews']);
    expect(worksPanel(tree)).toBeUndefined();
  });

  it('소개도 작품도 없으면 쓰는 탭인 후기만 남는다', () => {
    h.works = { data: { artworks: [] } };
    h.activeTab = 'reviews';
    const display = { ...publicDisplay, content: null } as DisplayDetailDto;
    const tree = nodes(DisplayDetailView({ display }));
    expect(find(tree, DetailTabNav)?.props.tabs).toEqual(['reviews']);
  });

  it('공개 시점 전(공개 여부 false)이면 일반 상세에서만 작품 · 콘텐츠를 숨기고 미리보기는 다 보인다', () => {
    h.activeTab = 'intro';
    const display = {
      ...publicDisplay,
      content: null,
      contentCategories: [{ categoryId: 1, name: '도록', contents: [] }],
      artworkContentVisible: false,
      exhibitionContentVisible: false,
    } as unknown as DisplayDetailDto;

    nodes(DisplayDetailView({ display }));
    expect(h.tabs).toEqual(['reviews']);

    const tree = nodes(DisplayDetailView({ display, previewMode: true }));
    expect(h.tabs).toEqual(['intro', 'works', 'reviews']);
    expect(find(tree, IntroPanel)?.props.display).toBe(display);
  });

  it('불러오기에 실패해 목록이 없으면 작품 탭을 남겨 다시 시도를 보인다', () => {
    h.works = { data: undefined };
    const tree = nodes(DisplayDetailView({ display: publicDisplay }));
    expect(find(tree, DetailTabNav)?.props.tabs).toEqual(['intro', 'works', 'reviews']);
    expect(find(tree, WorksPanel)).toBeDefined();
  });
});
