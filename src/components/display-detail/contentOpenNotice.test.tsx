import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';

import { IntroPanel } from './IntroPanel';
import { WorksPanel } from './WorksPanel';

const h = vi.hoisted(() => ({ artworks: [] as unknown[] }));

vi.mock('@/hooks/queries/useDisplayArtworks', () => ({
  useDisplayArtworks: () => ({
    data: { artworks: h.artworks },
    error: null,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock('@/hooks/useSkeleton', () => ({
  useSkeleton: () => ({ showSkeleton: false, skeletonProps: {} }),
}));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );
const texts = (node: ReactNode) =>
  nodes(node)
    .map((element) => element.props.children)
    .filter((child): child is string => typeof child === 'string');

// 개막 전(먼 미래)과 이미 끝난 전시 기간
const upcoming = {
  startDate: '2999-11-20',
  endDate: '2999-11-27',
  startTime: '10:00:00',
  endTime: '18:00:00',
};
const ended = {
  startDate: '2000-11-20',
  endDate: '2000-11-27',
  startTime: '10:00:00',
  endTime: '18:00:00',
};

const display = (overrides: Partial<DisplayDetailDto>) =>
  ({
    displayId: 190,
    content: null,
    contentCategories: [],
    exhibitionContentOpen: 'ON_EXHIBITION',
    period: upcoming,
    ...overrides,
  }) as unknown as DisplayDetailDto;

describe('전시 콘텐츠 공개 시점 안내(소개 탭)', () => {
  it('전시 시작일부터 공개이고 개막 전이라 콘텐츠가 비어 있으면 언제부터 보이는지 알린다', () => {
    expect(texts(IntroPanel({ display: display({}) }))).toContain('11.20부터 노출돼요');
  });

  it('바로 공개면 안내하지 않는다', () => {
    const tree = IntroPanel({ display: display({ exhibitionContentOpen: 'IMMEDIATELY' }) });
    expect(texts(tree).some((text) => text.includes('노출돼요'))).toBe(false);
  });

  it('개막이 지났으면 안내하지 않는다', () => {
    const tree = IntroPanel({ display: display({ period: ended }) });
    expect(texts(tree).some((text) => text.includes('노출돼요'))).toBe(false);
  });

  it('등록 중 전시 미리보기는 안내하지 않는다', () => {
    const tree = IntroPanel({ display: display({}), isPreview: true });
    expect(texts(tree).some((text) => text.includes('노출돼요'))).toBe(false);
  });
});

describe('작품 공개 시점 안내(작품 탭)', () => {
  const works = (props: Partial<Parameters<typeof WorksPanel>[0]>) =>
    texts(
      WorksPanel({
        displayId: 190,
        isPreview: false,
        artworkContentOpen: 'ON_EXHIBITION',
        period: upcoming,
        ...props,
      }),
    );

  it('전시 시작일부터 공개이고 개막 전이라 작품이 비어 있으면 언제부터 보이는지 알린다', () => {
    expect(works({})).toContain('11.20부터 노출돼요');
  });

  it('개막이 지났으면 작품이 없다고 알린다', () => {
    expect(works({ period: ended })).toContain('아직 등록한 작품이 없어요');
  });

  it('바로 공개면 작품이 없다고 알린다', () => {
    expect(works({ artworkContentOpen: 'IMMEDIATELY' })).toContain('아직 등록한 작품이 없어요');
  });

  it('등록 중 전시 미리보기는 작품을 올리라고 안내한다', () => {
    expect(works({ isPreview: true })).toContain(
      '아직 등록한 작품이 없어요\n전시에 작품을 올리면 여기에 보여요',
    );
  });
});
