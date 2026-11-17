import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

import type { DisplayDetailDto } from '@/api/dto';

import { DisplayPublishStatusLabel } from './DisplayPublishStatusLabel';
import { DisplaySummaryCard } from './DisplaySummaryCard';
import { VideoPosterBadge } from './VideoPosterBadge';

vi.mock('react-router-dom', () => ({ Link: 'a' }));
vi.mock('./OptimizedImage', () => ({ OptimizedImage: 'img' }));

type Element = ReactElement<Record<string, unknown>>;
const nodes = (node: ReactNode): Element[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<Record<string, unknown>>(child)
      ? [child, ...nodes(child.props.children as ReactNode)]
      : [],
  );

const display = {
  displayId: 7,
  title: '전시',
  organization: '홍익대학교',
  department: '시각디자인과',
  period: { startDate: '2026-11-01', endDate: '2026-11-30' },
  images: [
    { imageType: 'SUB', imageUrl: 'sub.jpg' },
    { imageType: 'MAIN', imageUrl: 'main.jpg' },
  ],
  location: { placeName: '전시장' },
} as unknown as DisplayDetailDto;

const render = (props: Partial<Parameters<typeof DisplaySummaryCard>[0]> = {}) =>
  nodes(DisplaySummaryCard({ display, status: 'DRAFT', ...props }));
const textsOf = (tree: Element[]) =>
  tree.map((node) => node.props.children).filter((c): c is string => typeof c === 'string');

describe('DisplaySummaryCard', () => {
  it('전시 미리보기는 전시 팀원용 미리보기 주소를 새 탭으로 연다', () => {
    const preview = render().find((node) => node.props.to === '/exhibition/7/preview');
    expect(preview?.props).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' });
  });

  it('대표 포스터(MAIN)를 먼저 쓴다', () => {
    const image = render().find((node) => node.type === 'img');
    expect(image?.props.src).toBe('main.jpg');
  });

  it('대표 포스터가 영상이면 썸네일 위에 영상 포스터 칩을 보인다', () => {
    expect(render().some((node) => node.type === VideoPosterBadge)).toBe(false);

    const tree = render({
      display: {
        ...display,
        images: [
          {
            imageType: 'MAIN',
            imageUrl: 'main.mp4',
            mediaType: 'VIDEO',
            thumbnailUrl: 'main-thumb.jpg',
          },
        ],
      } as unknown as DisplayDetailDto,
    });
    expect(tree.some((node) => node.type === VideoPosterBadge)).toBe(true);
    expect(tree.find((node) => node.type === 'img')?.props.src).toBe('main-thumb.jpg');
  });

  it('소속 · 일정 · 장소를 보인다', () => {
    const texts = textsOf(render());
    expect(texts).toEqual(
      expect.arrayContaining(['홍익대학교 시각디자인과', '2026.11.01 - 11.30', '전시장']),
    );
  });

  it('상태와 바꾼 문구를 공용 상태 라벨에 넘긴다', () => {
    const label = render({ status: 'PUBLISHED', statusLabel: '전시 예정' }).find(
      (node) => node.type === DisplayPublishStatusLabel,
    );
    expect(label?.props).toMatchObject({ status: 'PUBLISHED', label: '전시 예정' });
  });
});
