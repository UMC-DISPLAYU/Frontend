import type { DisplayPeriodDto } from '@/api/dto';
import { getExhibitionState } from '@/utils/exhibitionState';

/*
 * 작품 · 전시 콘텐츠 공개 시점(artworkContentOpen · exhibitionContentOpen)을 실서버처럼 흉내 낸다.
 * "전시 시작일부터(ON_EXHIBITION)"면 심사를 통과해 공개된 전시라도 개막 전까지 숨긴다. 실서버처럼 목록은 비우지 않고
 * 전시 상세의 artworkContentVisible · exhibitionContentVisible 을 false 로 준다.
 * 등록 중(DRAFT) 전시는 상세 주소가 404 라 판단하지 않는다
 */

type ContentOpenDisplay = {
  status?: string;
  period?: DisplayPeriodDto;
  artworkContentOpen?: string;
  exhibitionContentOpen?: string;
};

export type ContentKind = 'artwork' | 'exhibition';

export const isContentHiddenBeforeOpen = (
  display: ContentOpenDisplay | undefined,
  kind: ContentKind,
  now = Date.now(),
) => {
  if (!display || display.status === 'DRAFT') return false;
  const open = kind === 'artwork' ? display.artworkContentOpen : display.exhibitionContentOpen;
  return open === 'ON_EXHIBITION' && getExhibitionState(display.period, now) === 'upcoming';
};

/* 개막 전 공개 전시 확인용 목 전시. 상세 주소(/display/190)로만 들어가고 목록 · 지도에는 넣지 않는다 */
export const UPCOMING_DISPLAY_ID = 190;

const toLocalDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const daysFrom = (now: number, days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
};

/* base 전시를 복사해 오늘부터 3일 뒤 개막하는 공개 전시로 만든다. 작품 · 콘텐츠 공개는 전시 시작일부터 */
export const makeUpcomingDisplay = <TDisplay extends object>(base: TDisplay, now = Date.now()) => {
  const startDate = daysFrom(now, 3);
  const endDate = daysFrom(now, 10);

  return {
    ...base,
    displayId: UPCOMING_DISPLAY_ID,
    exhibitionId: UPCOMING_DISPLAY_ID,
    id: UPCOMING_DISPLAY_ID,
    status: 'PUBLISHED',
    startedAt: startDate,
    endedAt: endDate,
    startDate,
    endDate,
    startTime: '10:00',
    endTime: '18:00',
    period: { startDate, endDate, startTime: '10:00:00', endTime: '18:00:00' },
    artworkContentOpen: 'ON_EXHIBITION',
    exhibitionContentOpen: 'ON_EXHIBITION',
  };
};
