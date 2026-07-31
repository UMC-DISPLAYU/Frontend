import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { MY_PARTICIPATED_EXHIBITIONS } from '@/mocks/mypage';
import type { ExhibitionItem } from '@/types/mypage';

// TODO: API 받아서 연결하기
// 필요한 API: GET /v1/display/my
// 내가 owner이거나 teamMember로 속한 전시 목록을 반환하는 API
export const useMyDisplays = () =>
  useQuery<ExhibitionItem[]>({
    queryKey: [...queryKeys.displays.lists(), 'my'],
    queryFn: async () => {
      // TODO: API 받아서 연결하기
      return Promise.resolve(MY_PARTICIPATED_EXHIBITIONS);
    },
  });
