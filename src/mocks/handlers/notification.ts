import { http } from 'msw';

import type { NotificationBodySegmentDto, NotificationTargetDto } from '@/api/dto';
import { paths, success } from '@/mocks/response';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const text = (value: string): NotificationBodySegmentDto => ({ text: value, bold: false });
const bold = (value: string): NotificationBodySegmentDto => ({ text: value, bold: true });

type MockNotification = {
  notificationId: number;
  type: string;
  title: string;
  body: NotificationBodySegmentDto[];
  ago: number;
  target: NotificationTargetDto | null;
};

/* Swagger 예시 모양. 다음 페이지(size 10)까지 확인할 수 있게 12개를 둔다 */
const NOTIFICATIONS: MockNotification[] = [
  {
    notificationId: 12,
    type: 'ARTIST_NEW_EXHIBITION',
    title: '저장한 작가의 새 전시',
    body: [
      bold('송하윤'),
      text('님이 참여한 “'),
      bold('소프트 랜딩'),
      text('” 전시가 공개됐어요. 12.02 - 12.07 · 미온미디어관 B1'),
    ],
    ago: 30 * 1000,
    target: { type: 'DISPLAY_DETAIL', id: 101 },
  },
  {
    notificationId: 11,
    type: 'EXHIBITION_MEMBER_REMOVED',
    title: '전시에서 내보내짐',
    body: [
      text('“'),
      bold('손끝의 지도'),
      text('” 전시에서 내보내졌어요. 작가로 등록돼 있던 작품 '),
      bold('2점'),
      text('이 함께 삭제됐어요.'),
    ],
    ago: 25 * MINUTE,
    target: null,
  },
  ...Array.from(
    { length: 10 },
    (_, index): MockNotification => ({
      notificationId: 10 - index,
      type: 'ARTIST_NEW_EXHIBITION',
      title: '저장한 작가의 새 전시',
      body: [bold(`작가 ${index + 1}`), text('님의 새 전시가 공개됐어요.')],
      ago: (index + 1) * 5 * HOUR,
      target: { type: 'DISPLAY_DETAIL', id: 101 },
    }),
  ),
];

const createdAt = new Map(
  NOTIFICATIONS.map((item) => [item.notificationId, Date.now() - item.ago]),
);
// 처음에는 위의 두 개만 안 읽은 상태로 시작한다
let lastReadAt = Date.now() - 3 * HOUR;

// 서버처럼 시간대 표시 없는 UTC 시각(yyyy-MM-ddTHH:mm:ss)으로 준다(화면은 parseServerDate 로 보정)
const toServerTime = (time: number) => new Date(time).toISOString().slice(0, 19);

export const notificationHandlers = [
  ...paths('/api/v1/notifications').map((path) =>
    http.get(path, ({ request }) => {
      const url = new URL(request.url);
      const cursorId = Number(url.searchParams.get('cursorId')) || null;
      const size = Math.min(50, Math.max(1, Number(url.searchParams.get('size')) || 10));

      const rest = cursorId
        ? NOTIFICATIONS.filter((item) => item.notificationId < cursorId)
        : NOTIFICATIONS;
      const page = rest.slice(0, size);
      const hasNext = rest.length > size;

      return success('/api/v1/notifications', {
        notifications: page.map(({ notificationId, type, title, body, target }) => {
          const time = createdAt.get(notificationId) ?? Date.now();
          return {
            notificationId,
            type,
            title,
            body,
            isRead: time <= lastReadAt,
            createdAt: toServerTime(time),
            target,
          };
        }),
        nextCursorId: hasNext ? (page.at(-1)?.notificationId ?? null) : null,
        size: page.length,
        hasNext,
      });
    }),
  ),
  ...paths('/api/v1/notifications/unread').map((path) =>
    http.get(path, () =>
      success('/api/v1/notifications/unread', {
        hasUnread: [...createdAt.values()].some((time) => time > lastReadAt),
      }),
    ),
  ),
  ...paths('/api/v1/notifications/read').map((path) =>
    http.post(path, () => {
      lastReadAt = Date.now();
      return success('/api/v1/notifications/read', null);
    }),
  ),
];
