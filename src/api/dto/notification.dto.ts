import type { CursorPageRequestDto } from './common.dto';

/* 알림 문구 조각. 순서대로 이어 붙이고 bold 인 조각만 굵게 보인다 */
export interface NotificationBodySegmentDto {
  text: string;
  bold: boolean;
}

/* 백엔드 NotificationTargetType */
export type NotificationTargetType =
  | 'DISPLAY_DETAIL'
  | 'DISPLAY_WORKS'
  | 'MY_DISPLAYS'
  | 'MY_INVITATIONS';

/* 누르면 이동할 곳. DISPLAY_* 의 id 는 전시 ID, MY_* 는 화면만 가리켜 id 가 null */
export interface NotificationTargetDto {
  type: NotificationTargetType;
  id: number | null;
}

/* 백엔드 NotificationType. 문구 · 이동은 PM 알림함 명세(프로토타입 noti-demo.html)를 따른다 */
export type NotificationType =
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'EXHIBITION_INVITED'
  | 'WORK_COAUTHOR_ADDED'
  | 'WORK_PROXY_ASSIGNED'
  | 'WORK_DELETED'
  | 'WORK_DELETED_BY_ARTIST_LEAVE'
  | 'EXHIBITION_MEMBER_REMOVED'
  | 'EXHIBITION_DELETED'
  | 'ARTIST_NEW_EXHIBITION'
  | 'EXHIBITION_STARTED'
  | 'OPERATOR_NOTICE';

export interface NotificationDto {
  notificationId: number;
  type: NotificationType;
  title: string;
  body: NotificationBodySegmentDto[];
  /* 알림함을 열기 전 기준 */
  isRead: boolean;
  createdAt: string;
  /* 이동할 곳이 없는 알림은 null */
  target: NotificationTargetDto | null;
}

export type GetNotificationsRequestDto = CursorPageRequestDto;

export interface GetNotificationsResponseDataDto {
  notifications: NotificationDto[];
  nextCursorId: number | null;
  size: number;
  hasNext: boolean;
}

export interface NotificationUnreadResponseDataDto {
  hasUnread: boolean;
}
