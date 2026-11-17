import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NotificationUnreadResponseDataDto } from '@/api/dto';
import { getNotifications, getNotificationUnread, readNotifications } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';

/** 알림함을 열었을 때만 불러온다 */
export const useNotifications = ({ enabled }: { enabled: boolean }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam, signal }) =>
      getNotifications({ cursorId: pageParam ?? undefined }, signal),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: !!accessToken && enabled,
    // 열려 있는 동안 다시 받으면 읽음 처리 뒤 값이 와 이번에 보던 안 읽음 점이 사라진다. 실패는 다시 시도 버튼으로 복구한다
    refetchOnReconnect: false,
  });
};

/** 마이 알림함 아이콘의 빨간 점 */
export const useNotificationUnread = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: ({ signal }) => getNotificationUnread(signal),
    enabled: !!accessToken,
  });
};

/** 알림함을 연 시각까지의 알림을 모두 읽음 처리한다. 목록을 받은 뒤 불러야 한다 */
export const useReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readNotifications,
    onSuccess: () => {
      queryClient.setQueryData<NotificationUnreadResponseDataDto>(
        queryKeys.notifications.unread(),
        { hasUnread: false },
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
    },
  });
};
