import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { NotificationDto } from '@/api/dto';

import { toInboxNotification, toNotificationAction } from './notification';

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

describe('toNotificationAction', () => {
  it('전시 상세 · 전시 작업은 전시 ID 로 주소를 만든다', () => {
    expect(toNotificationAction({ type: 'DISPLAY_DETAIL', id: 7 })).toEqual({
      kind: 'link',
      to: '/display/7',
    });
    expect(toNotificationAction({ type: 'DISPLAY_WORKS', id: 7 })).toEqual({
      kind: 'link',
      to: '/exhibition/7/work',
    });
  });

  it('내 전시 관리는 주소로, 받은 초대는 시트로 연다', () => {
    expect(toNotificationAction({ type: 'MY_DISPLAYS', id: null })).toEqual({
      kind: 'link',
      to: '/display-management',
    });
    expect(toNotificationAction({ type: 'MY_INVITATIONS', id: null })).toEqual({
      kind: 'invitations',
    });
  });

  it('이동할 곳이 없거나, 전시 ID 가 빠졌거나, 모르는 종류면 null', () => {
    expect(toNotificationAction(null)).toBeNull();
    expect(toNotificationAction({ type: 'DISPLAY_DETAIL', id: null })).toBeNull();
    expect(
      toNotificationAction({ type: 'UNKNOWN', id: 1 } as unknown as NotificationDto['target']),
    ).toBeNull();
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

  it('알림 응답을 알림함 줄로 바꾼다', () => {
    expect(toInboxNotification(NOTIFICATION)).toEqual({
      id: 31,
      title: '저장한 작가의 새 전시',
      body: NOTIFICATION.body,
      timeLabel: '방금 전',
      isUnread: true,
      action: { kind: 'link', to: '/display/7' },
    });
  });

  it('읽은 알림 · 이동할 곳 없는 알림', () => {
    expect(toInboxNotification({ ...NOTIFICATION, isRead: true, target: null })).toMatchObject({
      isUnread: false,
      action: null,
    });
  });
});
