import type { Query, QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';

const ARTWORK_DETAILS_KEY = queryKeys.displayArtworks.details();

type ArtworkDetailLike = { displayId?: number; exhibitionInfo?: { displayId?: number } };

/* 작품 상세는 exhibitionInfo.displayId, 수정 데이터(detail(id) + 'edit')는 displayId 로 속한 전시를 알려 준다 */
export const isArtworkDetailOfDisplay = (query: Query, displayId: number) => {
  if (!ARTWORK_DETAILS_KEY.every((part, index) => query.queryKey[index] === part)) return false;
  const data = query.state.data as ArtworkDetailLike | undefined;
  return (data?.exhibitionInfo?.displayId ?? data?.displayId) === displayId;
};

/*
 * 전시 하나가 바뀌면(전시 작가명 · 전시 정보 · 공개 상태 · 작품 삭제) 그 전시 정보를 함께 담아 오는 작품 캐시를 무효화한다.
 * 목록은 여러 전시 작품이 섞여 있어 전부, 상세 · 수정 데이터는 그 전시 것만 다시 받는다.
 */
export const invalidateArtworksOfDisplay = (queryClient: QueryClient, displayId: number) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() });
  queryClient.invalidateQueries({
    predicate: (query) => isArtworkDetailOfDisplay(query, displayId),
  });
};
