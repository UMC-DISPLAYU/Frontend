import { setupServer } from 'msw/node';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { UPCOMING_DISPLAY_ID } from '@/mocks/data/contentOpen';
import { mockDb } from '@/mocks/data/repository';

import { artworkHandlers } from './artwork';
import { displayHandlers } from './display';

const server = setupServer(...displayHandlers, ...artworkHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const getData = async (path: string) => {
  const response = await fetch(`http://localhost/api/v1${path}`);
  return (await response.json()).success.data;
};

it('개막 전 공개 전시(190)는 콘텐츠 공개 시점이 전시 시작일부터라 콘텐츠를 비워서 준다', async () => {
  const detail = await getData(`/display/${UPCOMING_DISPLAY_ID}`);

  expect(detail.displayId).toBe(UPCOMING_DISPLAY_ID);
  expect(detail.status).toBe('PUBLISHED');
  expect(detail.exhibitionContentOpen).toBe('ON_EXHIBITION');
  expect(detail.contentCategories).toEqual([]);
  // 복사해 온 102번 전시에는 콘텐츠가 있다
  expect(mockDb.upcomingDisplay.contentCategories.length).toBeGreaterThan(0);
});

it('개막 전 공개 전시(190)의 작품 목록은 비어 있다', async () => {
  const data = await getData(`/artworks?displayId=${UPCOMING_DISPLAY_ID}`);

  expect(data.artworks).toEqual([]);
});

it('이미 끝난 전시(102)는 콘텐츠를 그대로 준다', async () => {
  const detail = await getData('/display/102');

  expect(detail.contentCategories.length).toBeGreaterThan(0);
});

it('확인용 전시(190)는 전시 목록에 넣지 않는다', () => {
  expect(mockDb.displays.some((display: { displayId: number }) => display.displayId === 190)).toBe(
    false,
  );
});
