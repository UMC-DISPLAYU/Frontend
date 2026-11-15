import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

import { mockDb } from '@/mocks/data/repository';

import { displayContentHandlers } from './displayContent';

const server = setupServer(...displayContentHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

const display = mockDb.displays[0];

// 목 데이터는 모듈 상태라 테스트마다 섹션 목록을 되돌린다
let savedCategories: unknown[] = [];
beforeEach(() => {
  savedCategories = [...display.contentCategories];
});
afterEach(() => {
  display.contentCategories = savedCategories;
});
const BASE = `http://localhost/api/v1/display/${display.displayId}/content-categories`;

const send = async (method: string, path: string, body: unknown) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
};

const categoryIds = () =>
  display.contentCategories.map((category: { categoryId: number }) => category.categoryId);

it('섹션을 만들 때 보낸 사진이 같은 순서로 함께 저장된다', async () => {
  const { status, body } = await send('POST', '', { name: '전시 전경', imageUrls: ['/a', '/b'] });

  expect(status).toBe(201);
  expect(
    body.success.data.contents.map((content: { imageUrl: string }) => content.imageUrl),
  ).toEqual(['/a', '/b']);
  expect(categoryIds()).toContain(body.success.data.categoryId);
});

it('사진을 빈 배열로 보내면 섹션을 만들지 않는다', async () => {
  const before = categoryIds();
  const { status } = await send('POST', '', { name: '빈 섹션', imageUrls: [] });

  expect(status).toBe(400);
  expect(categoryIds()).toEqual(before);
});

it('모든 섹션 id 를 보내면 그 순서로 저장하고 바뀐 목록을 돌려준다', async () => {
  const reversed = [...categoryIds()].reverse();
  const { status, body } = await send('PATCH', '/reorder', { orderedCategoryIds: reversed });

  expect(status).toBe(200);
  expect(
    body.success.data.categories.map((category: { categoryId: number }) => category.categoryId),
  ).toEqual(reversed);
  expect(categoryIds()).toEqual(reversed);
});

it('섹션 id 가 빠지거나 중복되면 순서를 바꾸지 않는다', async () => {
  const before = categoryIds();
  const missing = await send('PATCH', '/reorder', { orderedCategoryIds: before.slice(1) });
  const duplicated = await send('PATCH', '/reorder', {
    orderedCategoryIds: [before[0], ...before.slice(0, -1)],
  });

  expect(missing.status).toBe(400);
  expect(duplicated.status).toBe(400);
  expect(categoryIds()).toEqual(before);
});
