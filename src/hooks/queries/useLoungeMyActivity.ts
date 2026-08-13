import { useInfiniteQuery } from '@tanstack/react-query';

import { getMyLoungeComments, getMyLoungePosts, getMyLoungeScraps } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const DEFAULT_SIZE = 10;

type Options = { enabled?: boolean };

export const useMyLoungePosts = ({ enabled = true }: Options = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.loungeMe.posts(),
    queryFn: ({ pageParam }) => getMyLoungePosts({ cursorId: pageParam, size: DEFAULT_SIZE }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useMyLoungeScraps = ({ enabled = true }: Options = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.loungeMe.scraps(),
    queryFn: ({ pageParam }) => getMyLoungeScraps({ cursorId: pageParam, size: DEFAULT_SIZE }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });

export const useMyLoungeComments = ({ enabled = true }: Options = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.loungeMe.comments(),
    queryFn: ({ pageParam }) => getMyLoungeComments({ cursorId: pageParam, size: DEFAULT_SIZE }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });
