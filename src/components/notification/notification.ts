import type { NotificationBodySegmentDto, NotificationDto, NotificationTargetDto } from '@/api/dto';
import { formatRelativeTime } from '@/utils/date';

/** 알림을 눌렀을 때 할 일. 받은 초대는 마이 안의 시트라 주소 대신 따로 둔다 */
export type NotificationAction = { kind: 'link'; to: string } | { kind: 'invitations' };

export interface InboxNotification {
  id: number;
  title: string;
  body: NotificationBodySegmentDto[];
  /** '방금 전' · 'N분전' · 'YYYY.MM.DD' */
  timeLabel: string;
  isUnread: boolean;
  /** 이동할 곳이 없거나 모르는 종류면 null(누를 수 없는 줄) */
  action: NotificationAction | null;
}

/* 백엔드 NotificationTargetType. DISPLAY_* 의 id 는 전시 ID, MY_* 는 id 없이 화면만 가리킨다 */
export function toNotificationAction(
  target: NotificationTargetDto | null,
): NotificationAction | null {
  if (!target) return null;

  switch (target.type) {
    case 'DISPLAY_DETAIL':
      return target.id ? { kind: 'link', to: `/display/${target.id}` } : null;
    case 'DISPLAY_WORKS':
      return target.id ? { kind: 'link', to: `/exhibition/${target.id}/work` } : null;
    case 'MY_DISPLAYS':
      return { kind: 'link', to: '/display-management' };
    case 'MY_INVITATIONS':
      return { kind: 'invitations' };
    default:
      return null;
  }
}

export function toInboxNotification(notification: NotificationDto): InboxNotification {
  return {
    id: notification.notificationId,
    title: notification.title ?? '',
    body: notification.body ?? [],
    timeLabel: formatRelativeTime(notification.createdAt),
    isUnread: !notification.isRead,
    action: toNotificationAction(notification.target),
  };
}
