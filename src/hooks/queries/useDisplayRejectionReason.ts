import { useQuery } from '@tanstack/react-query';

import { getDisplayRejectionReason } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/* 반려 상태가 아닌 전시를 조회하면 서버가 409를 돌려주므로 enabled로 막는다 */
export const useDisplayRejectionReason = (displayId: number, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.displays.rejectionReason(displayId),
    queryFn: () => getDisplayRejectionReason(displayId),
    enabled: enabled && Number.isFinite(displayId) && displayId > 0,
  });
