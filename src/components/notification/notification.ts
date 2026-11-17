import type { NotificationBodySegmentDto, NotificationDto, NotificationTargetDto } from '@/api/dto';
import { formatRelativeTime } from '@/utils/date';

export interface InboxNotification {
  id: number;
  body: NotificationBodySegmentDto[];
  /** '방금 전' · 'N분전' · 'YYYY.MM.DD' */
  timeLabel: string;
  isUnread: boolean;
  /** 누르면 이동할 주소. 이동할 곳이 없거나 아직 모르는 종류면 null */
  to: string | null;
}

/* Swagger 에는 DISPLAY_DETAIL 예시만 있다. 다른 이동 종류가 확인되면 여기에 더한다 */
const TARGET_PATHS: Record<string, (id: number) => string> = {
  DISPLAY_DETAIL: (id) => `/exhibition/${id}`,
};

export function toNotificationPath(target: NotificationTargetDto | null) {
  if (!target) return null;
  return TARGET_PATHS[target.type]?.(target.id) ?? null;
}

export function toInboxNotification(notification: NotificationDto): InboxNotification {
  return {
    id: notification.notificationId,
    body: notification.body ?? [],
    timeLabel: formatRelativeTime(notification.createdAt),
    isUnread: !notification.isRead,
    to: toNotificationPath(notification.target),
  };
}
