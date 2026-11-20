import { setupServer } from 'msw/node';
import { afterAll, beforeAll, expect, it } from 'vitest';

import { mockDb } from '@/mocks/data/repository';

import { artworkHandlers } from './artwork';

const server = setupServer(...artworkHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

type SearchItem = { artworkId: number };

const search = async (query: Record<string, string>) => {
  const params = new URLSearchParams({ size: '100', ...query });
  const response = await fetch(`http://localhost/api/v1/artworks/search?${params}`);
  return (await response.json()).success.data as { artworks: SearchItem[]; isLast: boolean };
};

const findArtwork = (artworkId: number) =>
  mockDb.artworks.find((artwork: { artworkId: number }) => artwork.artworkId === artworkId);

const likesOf = (item: SearchItem) => findArtwork(item.artworkId)?.likeCount ?? 0;

it('정렬을 보내지 않거나 LATEST 면 작품 ID 내림차순이다', async () => {
  const [byDefault, byLatest] = await Promise.all([search({}), search({ sort: 'LATEST' })]);
  const ids = byDefault.artworks.map((item) => item.artworkId);

  expect(ids.length).toBeGreaterThan(1);
  expect(ids).toEqual([...ids].sort((a, b) => b - a));
  expect(byLatest.artworks.map((item) => item.artworkId)).toEqual(ids);
});

it('LIKES 면 좋아요 많은 순이고, 좋아요 수가 같으면 작품 ID 내림차순이다', async () => {
  const { artworks } = await search({ sort: 'LIKES' });

  for (let index = 1; index < artworks.length; index += 1) {
    const prev = artworks[index - 1];
    const current = artworks[index];
    expect(likesOf(prev)).toBeGreaterThanOrEqual(likesOf(current));
    if (likesOf(prev) === likesOf(current)) {
      expect(prev.artworkId).toBeGreaterThan(current.artworkId);
    }
  }
  // 목 데이터에서 인기순과 최신순이 실제로 달라야 화면에서 바뀌는 것을 확인할 수 있다
  const latest = await search({ sort: 'LATEST' });
  expect(artworks.map((item) => item.artworkId)).not.toEqual(
    latest.artworks.map((item) => item.artworkId),
  );
});

it('분야를 보내면 그 분야 작품만 준다', async () => {
  const { artworks } = await search({ field: 'SCULPTURE' });

  expect(artworks.length).toBeGreaterThan(0);
  artworks.forEach((item) => expect(findArtwork(item.artworkId)?.type).toBe('SCULPTURE'));
});

it('해당 분야 작품이 없으면 빈 목록과 마지막 페이지를 준다', async () => {
  const result = await search({ field: 'ARCHITECTURE' });

  expect(result.artworks).toEqual([]);
  expect(result.isLast).toBe(true);
});

it('분야 · 정렬을 함께 보내면 걸러낸 뒤 정렬하고, 페이지를 나눠도 순서가 이어진다', async () => {
  const all = await search({ field: 'SCULPTURE', sort: 'LIKES' });
  const first = await search({ field: 'SCULPTURE', sort: 'LIKES', page: '0', size: '2' });
  const second = await search({ field: 'SCULPTURE', sort: 'LIKES', page: '1', size: '2' });

  expect([...first.artworks, ...second.artworks].map((item) => item.artworkId)).toEqual(
    all.artworks.slice(0, 4).map((item) => item.artworkId),
  );
  expect(first.isLast).toBe(false);
});
