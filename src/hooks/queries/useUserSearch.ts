import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/api/apiError';
import { searchUsers } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/*
 * 닉네임으로 사용자를 검색합니다.
 * 검색 결과 없음 코드만 빈 배열로 바꾸고 다른 실패는 화면에 전달합니다.
 */
export const useUserSearch = (nickname: string) => {
  const keyword = nickname.trim();

  return useQuery({
    queryKey: queryKeys.users.search(keyword),
    queryFn: async () => {
      try {
        return await searchUsers({ nickname: keyword });
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 404 &&
          error.code === 'USER_NICKNAME_NOT_FOUND'
        )
          return [];
        throw error;
      }
    },
    enabled: keyword.length > 0,
  });
};
