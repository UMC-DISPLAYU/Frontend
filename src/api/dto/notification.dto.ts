import type { CursorPageRequestDto } from './common.dto';

/* 알림 문구 조각. 순서대로 이어 붙이고 bold 인 조각만 굵게 보인다 */
export interface NotificationBodySegmentDto {
  text: string;
  bold: boolean;
}

/* 누르면 이동할 곳. Swagger 에는 예시(DISPLAY_DETAIL)만 있어 전체 값은 아직 모른다 */
export interface NotificationTargetDto {
  type: string;
  id: number;
}

export interface NotificationDto {
  notificationId: number;
  /* 예: ARTIST_NEW_EXHIBITION, EXHIBITION_MEMBER_REMOVED. 전체 값은 아직 모른다 */
  type: string;
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
