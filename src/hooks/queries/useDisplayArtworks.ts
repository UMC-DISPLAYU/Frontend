import { useQuery } from '@tanstack/react-query';

import { getDisplayArtworks, getMyArtworks } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayArtworks = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.byDisplayId(displayId),
    queryFn: () => getDisplayArtworks(displayId),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });

// 가짜 쿼리 훅: 백엔드에 내 작품 전체 조회 API가 생기면 실제 query hook으로 교체해야 합니다.
export const useMyArtworks = () =>
  useQuery({
    queryKey: queryKeys.displayArtworks.me(),
    queryFn: getMyArtworks,
  });
