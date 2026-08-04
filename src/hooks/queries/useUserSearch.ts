import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { searchUsers } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/*
 * 닉네임으로 사용자를 검색합니다.
 * 서버는 결과가 없을 때 404를 내려주므로, 빈 배열로 바꿔 화면에서 에러로 다루지 않게 합니다.
 */
export const useUserSearch = (nickname: string) => {
  const keyword = nickname.trim();

  return useQuery({
    queryKey: queryKeys.users.search(keyword),
    queryFn: async () => {
      try {
        return await searchUsers({ nickname: keyword });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return [];
        throw error;
      }
    },
    enabled: keyword.length > 0,
    placeholderData: keepPreviousData,
  });
};
