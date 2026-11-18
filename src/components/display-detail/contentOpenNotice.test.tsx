import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

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

describe('작품 탭 빈 목록 안내', () => {
  const works = (props: Partial<Parameters<typeof WorksPanel>[0]>) =>
    texts(
      WorksPanel({
        displayId: 190,
        isPreview: false,
        ...props,
      }),
    );

  it('작품이 비어 있으면 공개 시점과 상관없이 작품이 없다고만 알린다', () => {
    const list = works({});
    expect(list).toContain('아직 등록한 작품이 없어요');
    expect(list.some((text) => text.includes('노출돼요'))).toBe(false);
  });

  it('등록 중 전시 미리보기는 작품을 올리라고 안내한다', () => {
    expect(works({ isPreview: true })).toContain(
      '아직 등록한 작품이 없어요\n전시에 작품을 올리면 여기에 보여요',
    );
  });
});
