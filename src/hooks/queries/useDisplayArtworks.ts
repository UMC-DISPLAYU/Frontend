import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';

// TODO: API 받아서 연결하기
// 필요한 API: GET /v1/display/:displayId/artworks
interface MockArtwork {
  id: string;
  title: string;
  artist: string;
  image: string | null;
}

const MOCK_ARTWORKS: MockArtwork[] = [
  { id: 'a1', title: '흐름의 기억', artist: '이준호', image: null },
];

export const useDisplayArtworks = (displayId: number) =>
  useQuery({
    queryKey: [...queryKeys.displayArtworks.lists(), 'by-display', displayId],
    queryFn: async () => {
      // TODO: API 받아서 연결하기
      return Promise.resolve(MOCK_ARTWORKS);
    },
    enabled: Number.isFinite(displayId) && displayId > 0,
  });
