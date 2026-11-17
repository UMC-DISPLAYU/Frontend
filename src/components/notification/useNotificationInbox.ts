import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { NotificationUnreadResponseDataDto } from '@/api/dto';
import { queryKeys } from '@/api/queryKeys';
import {
  useNotifications,
  useNotificationUnread,
  useReadNotifications,
} from '@/hooks/queries/useNotifications';

import { toInboxNotification } from './notification';

/**
 * 알림함 열림 · 목록 · 읽음 처리.
 * 서버의 isRead 는 알림함을 열기 전 기준이라, 열 때마다 목록을 새로 받고 그 뒤에 전체 읽음 처리를 보낸다.
 * 그래서 이번에 연 알림함에는 안 읽음 점이 그대로 보이고, 다음에 열면 읽음으로 보인다(프로토타입과 같다)
 */
export function useNotificationInbox() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const hasRequestedReadRef = useRef(false);

  const unreadQuery = useNotificationUnread();
  const listQuery = useNotifications({ enabled: isOpen });
  const { mutate: markAllRead } = useReadNotifications();

  const notifications = useMemo(
    () =>
      listQuery.data?.pages.flatMap((page) => page.notifications).map(toInboxNotification) ?? [],
    [listQuery.data],
  );

  useEffect(() => {
    if (!isOpen || !listQuery.isSuccess || hasRequestedReadRef.current) return;
    hasRequestedReadRef.current = true;
    markAllRead();
  }, [isOpen, listQuery.isSuccess, markAllRead]);

  const open = useCallback(() => {
    hasRequestedReadRef.current = false;
    // 프로토타입처럼 열자마자 아이콘의 점을 지운다. 읽음 처리가 실패하면 서버 값으로 다시 맞춘다
    queryClient.setQueryData<NotificationUnreadResponseDataDto>(queryKeys.notifications.unread(), {
      hasUnread: false,
    });
    setIsOpen(true);
  }, [queryClient]);

  const close = useCallback(() => {
    setIsOpen(false);
    // 다음에 열 때 읽음 처리 뒤의 목록을 새로 받도록 지난 목록을 버린다
    queryClient.removeQueries({ queryKey: queryKeys.notifications.list() });
  }, [queryClient]);

  return {
    isOpen,
    open,
    close,
    hasUnread: unreadQuery.data?.hasUnread ?? false,
    notifications,
    isPending: listQuery.isPending,
    error: listQuery.error,
    refetch: listQuery.refetch,
    hasNextPage: listQuery.hasNextPage && !listQuery.isError,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    fetchNextPage: listQuery.fetchNextPage,
  };
}
