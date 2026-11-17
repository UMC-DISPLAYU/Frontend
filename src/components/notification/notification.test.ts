import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NotificationDto } from '@/api/dto';

import { toInboxNotification, toNotificationPath } from './notification';

const NOTIFICATION: NotificationDto = {
  notificationId: 31,
  type: 'ARTIST_NEW_EXHIBITION',
  title: '저장한 작가의 새 전시',
  body: [
    { text: '송하윤', bold: true },
    { text: '님의 새 전시가 공개됐어요.', bold: false },
  ],
  isRead: false,
  createdAt: '2026-12-02T08:59:00',
  target: { type: 'DISPLAY_DETAIL', id: 7 },
};

describe('toNotificationPath', () => {
  it('전시 상세로 이동하는 알림은 전시 상세 주소를 만든다', () => {
    expect(toNotificationPath({ type: 'DISPLAY_DETAIL', id: 7 })).toBe('/exhibition/7');
  });

  it('이동할 곳이 없거나 모르는 종류면 null', () => {
    expect(toNotificationPath(null)).toBeNull();
    expect(toNotificationPath({ type: 'UNKNOWN', id: 1 })).toBeNull();
  });
});

describe('toInboxNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-02T09:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('알림 응답을 알림함 행으로 바꾼다', () => {
    expect(toInboxNotification(NOTIFICATION)).toEqual({
      id: 31,
      body: NOTIFICATION.body,
      timeLabel: '방금 전',
      isUnread: true,
      to: '/exhibition/7',
    });
  });

  it('읽은 알림 · 이동할 곳 없는 알림', () => {
    expect(toInboxNotification({ ...NOTIFICATION, isRead: true, target: null })).toMatchObject({
      isUnread: false,
      to: null,
    });
  });
});
