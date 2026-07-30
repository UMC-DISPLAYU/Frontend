import { useQuery } from '@tanstack/react-query';

import { getDisplayArtworks } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayArtworks = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.byDisplayId(displayId),
    queryFn: () => getDisplayArtworks(displayId),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });
