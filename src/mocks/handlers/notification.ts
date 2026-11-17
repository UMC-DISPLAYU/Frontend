import { http } from 'msw';

import type {
  NotificationBodySegmentDto,
  NotificationTargetDto,
  NotificationType,
} from '@/api/dto';
import { paths, success } from '@/mocks/response';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// 목 전시 101 은 내가 대표자인 전시라 전시 상세 · 전시 작업 이동을 모두 확인할 수 있다
const MOCK_DISPLAY_ID = 101;

const text = (value: string): NotificationBodySegmentDto => ({ text: value, bold: false });
const bold = (value: string): NotificationBodySegmentDto => ({ text: value, bold: true });
const quoted = (value: string) => [text('“'), bold(value), text('”')];

type MockNotification = {
  type: NotificationType;
  title: string;
  body: NotificationBodySegmentDto[];
  ago: number;
  target: NotificationTargetDto | null;
};

/* PM 알림함 명세(프로토타입 noti-demo.html)의 12종. 명세의 알림함 순서(최신순) 그대로 */
const NOTIFICATIONS: MockNotification[] = [
  {
    type: 'OPERATOR_NOTICE',
    title: '전시 노출 중단 안내',
    body: [text('조치 대상, 사유와 필요한 후속 조치를 작성해 주세요.')],
    ago: 30 * 1000,
    target: null,
  },
  {
    type: 'EXHIBITION_INVITED',
    title: '전시 초대',
    body: [
      ...quoted('펼쳐지는 장면'),
      text(' 전시에 팀원으로 초대받았어요. 초대한 사람: '),
      bold('김도윤(doyoon)'),
    ],
    ago: HOUR,
    target: { type: 'MY_INVITATIONS', id: null },
  },
  {
    type: 'REQUEST_APPROVED',
    title: '등록 요청 승인',
    body: [
      ...quoted('빛의 결 | 조용한 흐름'),
      text(' 전시의 등록 요청이 승인됐어요. 승인된 시점에 저장돼 있던 내용이 공개돼요.'),
    ],
    ago: 3 * HOUR,
    target: { type: 'MY_DISPLAYS', id: null },
  },
  {
    type: 'WORK_COAUTHOR_ADDED',
    title: '공동 작가로 추가됨',
    body: [
      ...quoted('접으면 달라지는 지도'),
      text(' 작품에 공동 작가로 추가됐어요. 작가와 같은 권한으로 수정·삭제할 수 있어요.'),
    ],
    ago: 5 * HOUR,
    target: { type: 'DISPLAY_WORKS', id: MOCK_DISPLAY_ID },
  },
  {
    type: 'WORK_PROXY_ASSIGNED',
    title: '작가로 지정됨',
    body: [
      ...quoted('장면을 넘기는 극장'),
      text(' 작품의 작가로 지정됐어요. 등록한 사람: '),
      bold('김도윤'),
    ],
    ago: 8 * HOUR,
    target: { type: 'DISPLAY_WORKS', id: MOCK_DISPLAY_ID },
  },
  {
    type: 'EXHIBITION_STARTED',
    title: '저장한 전시 시작',
    body: [
      text('저장한 '),
      ...quoted('빛이 지나간 자리'),
      text(' 전시가 시작됐어요. 12.04 - 12.06 · 스튜디오 여백 B1'),
    ],
    ago: 20 * HOUR,
    target: { type: 'DISPLAY_DETAIL', id: MOCK_DISPLAY_ID },
  },
  {
    type: 'ARTIST_NEW_EXHIBITION',
    title: '저장한 작가의 새 전시',
    body: [
      bold('송하윤'),
      text('님이 참여한 '),
      ...quoted('재생 중'),
      text(' 전시가 공개됐어요. 12.02 - 12.07 · 미온미디어관 B1'),
    ],
    ago: 2 * DAY,
    target: { type: 'DISPLAY_DETAIL', id: MOCK_DISPLAY_ID },
  },
  {
    type: 'WORK_DELETED',
    title: '작품 삭제',
    body: [
      ...quoted('얇은 경계'),
      text(' 작품이 삭제됐어요. 삭제한 사람: '),
      bold('서유진'),
      text('. 복구할 수 없어요.'),
    ],
    ago: 3 * DAY,
    target: null,
  },
  {
    type: 'WORK_DELETED_BY_ARTIST_LEAVE',
    title: '작품 삭제',
    body: [
      text('작품 '),
      bold('3점'),
      text('('),
      ...quoted('얇은 경계'),
      text(', '),
      ...quoted('되감는 계단'),
      text(', '),
      ...quoted('비가 지난 가방'),
      text(')이 삭제됐어요. 함께 작가로 등록된 계정이 '),
      ...quoted('손끝의 지도'),
      text(' 전시에서 나가거나 내보내져 작품도 함께 삭제됐어요. 복구할 수 없어요.'),
    ],
    ago: 4 * DAY,
    target: null,
  },
  {
    type: 'REQUEST_REJECTED',
    title: '등록 요청 반려',
    body: [
      ...quoted('빛의 결 | 조용한 흐름'),
      text(
        ' 전시의 등록 요청이 반려됐어요. 이미지 출처를 확인할 수 없어요 수정한 뒤 다시 요청해 주세요',
      ),
    ],
    ago: 5 * DAY,
    target: { type: 'MY_DISPLAYS', id: null },
  },
  {
    type: 'EXHIBITION_MEMBER_REMOVED',
    title: '전시에서 내보내짐',
    body: [
      ...quoted('손끝의 지도'),
      text(' 전시에서 내보내졌어요. 작가로 등록돼 있던 작품 '),
      bold('2점'),
      text('이 함께 삭제됐어요.'),
    ],
    ago: 6 * DAY,
    target: null,
  },
  {
    type: 'EXHIBITION_DELETED',
    title: '전시 삭제',
    body: [
      ...quoted('움직임의 기록'),
      text(' 전시가 삭제됐어요. 작가로 등록돼 있던 작품 '),
      bold('5점'),
      text('이 함께 삭제됐어요.'),
    ],
    ago: 7 * DAY,
    target: null,
  },
];

const items = NOTIFICATIONS.map((item, index) => ({
  ...item,
  notificationId: NOTIFICATIONS.length - index,
  createdAt: Date.now() - item.ago,
}));
// 명세 데모처럼 위의 세 개만 안 읽은 상태로 시작한다
let lastReadAt = Date.now() - 4 * HOUR;

// 서버처럼 시간대 표시 없는 UTC 시각(yyyy-MM-ddTHH:mm:ss)으로 준다(화면은 parseServerDate 로 보정)
const toServerTime = (time: number) => new Date(time).toISOString().slice(0, 19);

export const notificationHandlers = [
  ...paths('/api/v1/notifications').map((path) =>
    http.get(path, ({ request }) => {
      const url = new URL(request.url);
      const cursorId = Number(url.searchParams.get('cursorId')) || null;
      const size = Math.min(50, Math.max(1, Number(url.searchParams.get('size')) || 10));

      const rest = cursorId ? items.filter((item) => item.notificationId < cursorId) : items;
      const page = rest.slice(0, size);
      const hasNext = rest.length > size;

      return success('/api/v1/notifications', {
        notifications: page.map(({ notificationId, type, title, body, target, createdAt }) => ({
          notificationId,
          type,
          title,
          body,
          isRead: createdAt <= lastReadAt,
          createdAt: toServerTime(createdAt),
          target,
        })),
        nextCursorId: hasNext ? (page.at(-1)?.notificationId ?? null) : null,
        size: page.length,
        hasNext,
      });
    }),
  ),
  ...paths('/api/v1/notifications/unread').map((path) =>
    http.get(path, () =>
      success('/api/v1/notifications/unread', {
        hasUnread: items.some((item) => item.createdAt > lastReadAt),
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
