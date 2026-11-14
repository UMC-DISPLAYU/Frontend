import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { ArtworkArtists } from './ArtworkArtists';

vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (initial: unknown) => [initial, vi.fn()],
}));
vi.mock('react-router-dom', () => ({ Link: 'a' }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );

const artists = [{ userId: 3, name: '김서윤' }, { name: '직접 입력 작가' }];

describe('작가 이름', () => {
  it('공개 작품 상세는 계정 있는 작가를 프로필 링크와 화살표로 보인다', () => {
    const tree = nodes(ArtworkArtists({ artists }));
    const link = tree.find((node) => node.type === 'a');
    expect(link?.props.to).toBe('/artist/3');
    expect(nodes(link?.props.children as ReactNode).some((node) => node.type === 'img')).toBe(true);
  });

  it('작품 미리보기는 화살표는 그대로 두고 프로필로 이동하지 않는다', () => {
    const tree = nodes(ArtworkArtists({ artists, linkToProfile: false }));
    expect(tree.some((node) => node.type === 'a')).toBe(false);
    const named = tree.find(
      (node) =>
        node.type === 'span' && Children.toArray(node.props.children as ReactNode)[0] === '김서윤',
    );
    expect(nodes(named?.props.children as ReactNode).some((node) => node.type === 'img')).toBe(
      true,
    );
  });
});
