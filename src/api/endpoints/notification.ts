import type {
  GetNotificationsRequestDto,
  GetNotificationsResponseDataDto,
  NotificationUnreadResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/notifications
export const getNotifications = async (
  params: GetNotificationsRequestDto = {},
  signal?: AbortSignal,
): Promise<GetNotificationsResponseDataDto> =>
  apiRequest('/v1/notifications', { query: params, signal });

// GET /v1/notifications/unread
export const getNotificationUnread = async (
  signal?: AbortSignal,
): Promise<NotificationUnreadResponseDataDto> => apiRequest('/v1/notifications/unread', { signal });

// POST /v1/notifications/read
export const readNotifications = async (): Promise<null> =>
  apiRequest('/v1/notifications/read', { method: 'POST' });
