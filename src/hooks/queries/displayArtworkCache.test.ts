import type { Query, QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/api/queryKeys';

import { invalidateArtworksOfDisplay, isArtworkDetailOfDisplay } from './displayArtworkCache';

const query = (queryKey: readonly unknown[], data: unknown) =>
  ({ queryKey, state: { data } }) as unknown as Query;

describe('isArtworkDetailOfDisplay', () => {
  it('작품 상세는 exhibitionInfo.displayId 로 전시를 가린다', () => {
    const detail = query(queryKeys.displayArtworks.detail(1), { exhibitionInfo: { displayId: 7 } });

    expect(isArtworkDetailOfDisplay(detail, 7)).toBe(true);
    expect(isArtworkDetailOfDisplay(detail, 8)).toBe(false);
  });

  it('수정 데이터는 displayId 로 전시를 가린다', () => {
    expect(
      isArtworkDetailOfDisplay(query(queryKeys.displayArtworks.edit(1), { displayId: 7 }), 7),
    ).toBe(true);
  });

  it('작품 상세가 아닌 key 나 아직 데이터가 없는 상세는 건드리지 않는다', () => {
    expect(
      isArtworkDetailOfDisplay(
        query(queryKeys.displayArtworks.byDisplayId(7), { displayId: 7 }),
        7,
      ),
    ).toBe(false);
    expect(isArtworkDetailOfDisplay(query(queryKeys.displayArtworks.detail(1), undefined), 7)).toBe(
      false,
    );
  });
});

describe('invalidateArtworksOfDisplay', () => {
  it('작품 목록 전체와 그 전시의 작품 상세만 무효화한다', () => {
    const invalidateQueries = vi.fn();
    invalidateArtworksOfDisplay({ invalidateQueries } as unknown as QueryClient, 7);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.displayArtworks.lists() });
    const { predicate } = invalidateQueries.mock.calls[1][0] as {
      predicate: (query: Query) => boolean;
    };
    expect(
      predicate(query(queryKeys.displayArtworks.detail(1), { exhibitionInfo: { displayId: 7 } })),
    ).toBe(true);
    expect(
      predicate(query(queryKeys.displayArtworks.detail(2), { exhibitionInfo: { displayId: 9 } })),
    ).toBe(false);
  });
});
