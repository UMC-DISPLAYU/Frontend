import { describe, expect, it } from 'vitest';

import { isContentHiddenBeforeOpen, makeUpcomingDisplay, UPCOMING_DISPLAY_ID } from './contentOpen';

const period = {
  startDate: '2026-11-20',
  endDate: '2026-11-27',
  startTime: '10:00:00',
  endTime: '18:00:00',
};
const at = (value: string) => new Date(value).getTime();
const published = {
  status: 'PUBLISHED',
  period,
  artworkContentOpen: 'ON_EXHIBITION',
  exhibitionContentOpen: 'ON_EXHIBITION',
};

describe('isContentHiddenBeforeOpen', () => {
  it('전시 시작일부터 공개면 개막 시각 전까지 작품 · 콘텐츠를 숨긴다', () => {
    const beforeOpen = at('2026-11-20T09:59:59');
    expect(isContentHiddenBeforeOpen(published, 'artwork', beforeOpen)).toBe(true);
    expect(isContentHiddenBeforeOpen(published, 'exhibition', beforeOpen)).toBe(true);
  });

  it('개막 시각이 되면 숨기지 않는다', () => {
    expect(isContentHiddenBeforeOpen(published, 'artwork', at('2026-11-20T10:00:00'))).toBe(false);
  });

  it('바로 공개면 개막 전이어도 숨기지 않는다', () => {
    const display = { ...published, artworkContentOpen: 'IMMEDIATELY' };
    const beforeOpen = at('2026-11-19T00:00:00');
    expect(isContentHiddenBeforeOpen(display, 'artwork', beforeOpen)).toBe(false);
    // 작품과 콘텐츠의 공개 시점은 따로 본다
    expect(isContentHiddenBeforeOpen(display, 'exhibition', beforeOpen)).toBe(true);
  });

  it('등록 중(DRAFT) 전시는 팀원 미리보기라 숨기지 않는다', () => {
    const draft = { ...published, status: 'DRAFT' };
    expect(isContentHiddenBeforeOpen(draft, 'artwork', at('2026-11-19T00:00:00'))).toBe(false);
  });

  it('전시를 모르거나 기간이 없으면 숨기지 않는다', () => {
    expect(isContentHiddenBeforeOpen(undefined, 'artwork')).toBe(false);
    expect(isContentHiddenBeforeOpen({ ...published, period: undefined }, 'artwork')).toBe(false);
  });
});

describe('makeUpcomingDisplay', () => {
  it('오늘부터 3일 뒤 개막하는 공개 전시로 만들고, 작품 · 콘텐츠는 전시 시작일부터 공개한다', () => {
    const now = at('2026-11-17T12:00:00');
    const display = makeUpcomingDisplay({ title: '물성매력', displayId: 102 }, now);

    expect(display).toMatchObject({
      displayId: UPCOMING_DISPLAY_ID,
      title: '물성매력',
      status: 'PUBLISHED',
      period: { startDate: '2026-11-20', endDate: '2026-11-27' },
      artworkContentOpen: 'ON_EXHIBITION',
      exhibitionContentOpen: 'ON_EXHIBITION',
    });
    expect(isContentHiddenBeforeOpen(display, 'artwork', now)).toBe(true);
  });

  it('달이 바뀌어도 날짜를 YYYY-MM-DD 로 맞춘다', () => {
    const display = makeUpcomingDisplay({}, at('2026-12-30T12:00:00'));
    expect(display.period).toMatchObject({ startDate: '2027-01-02', endDate: '2027-01-09' });
  });
});
