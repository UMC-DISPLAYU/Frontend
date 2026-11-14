import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { ArtworkDetail } from '@/types/exhibition';

import { ArtworkExhibitionRow } from './ArtworkExhibitionRow';
import { ArtworkLabel } from './ArtworkLabel';
import { ArtworkMeta } from './ArtworkMeta';

vi.mock('@/hooks/queries/useArtworkDetail', () => ({
  useToggleArtworkLike: () => ({ isPending: false, mutate: vi.fn() }),
}));
vi.mock('@/hooks/usePermissionRequiredModal', () => ({
  useLoginRequiredModal: () => ({ loginModal: null, openLoginModal: vi.fn() }),
}));
vi.mock('@/hooks/usePolicy', () => ({ useArchivePolicy: () => ({}) }));
vi.mock('./ArtworkActions', () => ({ ArtworkInlineActions: () => null }));
vi.mock('./ArtworkExhibitionRow', () => ({ ArtworkExhibitionRow: () => null }));
vi.mock('./ArtworkLabel', () => ({ ArtworkLabel: () => null }));
vi.mock('./ArtworkSaveButton', () => ({ ArtworkSaveButton: () => null }));

type Element = ReactElement<Record<string, unknown>>;

const artwork = {
  artworkId: 3,
  artworkName: '작품',
  exhibitionId: '7',
  exhibitionTitle: '전시',
} as unknown as ArtworkDetail;

const labelOf = (previewMode?: boolean) => {
  const fragment = ArtworkMeta({
    artwork,
    artists: [{ userId: 1, name: '작가' }],
    exhibitionState: null,
    isPreview: true,
    previewMode,
  }) as Element;
  return (fragment.props.children as ReactNode[]).find(
    (child) => (child as Element)?.type === ArtworkLabel,
  ) as Element;
};

describe('작품 이름표', () => {
  it('작품 미리보기는 소속 전시 줄이 없고 작가 이름을 눌러도 이동하지 않는다', () => {
    const label = labelOf(true);
    expect(label.props.exhibition).toBeUndefined();
    expect(label.props.linkArtists).toBe(false);
  });

  it('작품 상세(공개 전 전시 포함)는 소속 전시 줄과 작가 링크를 그대로 둔다', () => {
    const label = labelOf();
    expect((label.props.exhibition as Element).type).toBe(ArtworkExhibitionRow);
    expect(label.props.linkArtists).toBe(true);
  });
});
