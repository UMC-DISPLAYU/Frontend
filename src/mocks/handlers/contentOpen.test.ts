import { setupServer } from 'msw/node';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';

import { UPCOMING_DISPLAY_ID } from '@/mocks/data/contentOpen';
import { mockDb } from '@/mocks/data/repository';

import { artworkHandlers } from './artwork';
import { displayHandlers } from './display';

const server = setupServer(...displayHandlers, ...artworkHandlers);

// 전시 상세 목은 페이지 주소의 ?mock= 시나리오를 읽는다(scenario.ts). Node 에는 window 가 없어 빈 주소로 둔다
beforeAll(() => {
  vi.stubGlobal('window', { location: { search: '' } });
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

const getData = async (path: string) => {
  const response = await fetch(`http://localhost/api/v1${path}`);
  return (await response.json()).success.data;
};

it('개막 전 공개 전시(190)는 실서버처럼 콘텐츠를 그대로 주고 공개 여부만 false 로 준다', async () => {
  const detail = await getData(`/display/${UPCOMING_DISPLAY_ID}`);

  expect(detail.displayId).toBe(UPCOMING_DISPLAY_ID);
  expect(detail.status).toBe('PUBLISHED');
  expect(detail.exhibitionContentOpen).toBe('ON_EXHIBITION');
  expect(detail.exhibitionContentVisible).toBe(false);
  expect(detail.artworkContentVisible).toBe(false);
  expect(detail.contentCategories.length).toBeGreaterThan(0);
});

it('이미 끝난 전시(102)는 콘텐츠를 그대로 주고 공개 중으로 알린다', async () => {
  const detail = await getData('/display/102');

  expect(detail.contentCategories.length).toBeGreaterThan(0);
  expect(detail.exhibitionContentVisible).toBe(true);
  expect(detail.artworkContentVisible).toBe(true);
});

it('확인용 전시(190)는 전시 목록에 넣지 않는다', () => {
  expect(mockDb.displays.some((display: { displayId: number }) => display.displayId === 190)).toBe(
    false,
  );
});
