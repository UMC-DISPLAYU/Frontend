import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { handlers } from '@/mocks';
import { mockDb } from '@/mocks/data/repository';

const server = setupServer(...handlers);

// 목 핸들러는 페이지 주소의 ?mock= 시나리오를 읽는다(scenario.ts). Node 에는 window 가 없어 빈 주소로 둔다
beforeAll(() => {
  vi.stubGlobal('window', { location: { search: '' } });
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

const call = async (method: string, path: string, body?: unknown) => {
  const response = await fetch(`http://localhost/api/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mock-access-token' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, text: await response.text() };
};

const POSTER_FIELDS = ['posterCrop', 'posterFit', 'posterEdgeColor'];
const ARTWORK_FIELDS = ['artworkCrop', 'artworkFit'];

/* 서버에 요청한 목록(#666)과 같은 API. 요청 · 응답 모두 같은 필드를 주고받는다 */
const DISPLAY_APIS: [string, string, unknown?][] = [
  [
    'POST',
    '/display',
    { title: '새 전시', posterMedia: { imageUrl: 'https://x/a.png', mediaType: 'IMAGE' } },
  ],
  ['PATCH', '/display', { displayId: 101, title: '수정' }],
  ['GET', '/display/101'],
  ['GET', '/display/search'],
  ['GET', '/display/popular'],
  ['GET', '/display/closing-soon'],
  ['GET', '/display/graduation'],
  ['GET', '/display/me'],
  ['GET', '/display/artists/1'],
  ['GET', '/display/invitation/mock-invitation-101'],
  ['GET', '/archives/exhibitions'],
  ['GET', '/display-invitations/me'],
  ['PATCH', '/display/publish', { displayId: 101 }],
  ['PATCH', '/display/101/draft'],
  ['PATCH', '/display/101/reservation', { artworkContentOpen: 'ON_EXHIBITION' }],
];

const ARTWORK_BODY = {
  displayId: 101,
  artworkName: '새 작품',
  types: ['PAINTING'],
  images: [{ imageUrl: 'https://x/a.png', mediaType: 'IMAGE', isThumbnail: true }],
};
const ARTWORK_APIS: [string, string, unknown?][] = [
  ['POST', '/artworks', ARTWORK_BODY],
  ['PATCH', '/artworks/1001', ARTWORK_BODY],
  ['GET', '/artworks?displayId=101'],
  ['GET', '/artworks?userId=1'],
  ['GET', '/artworks/1001'],
  ['GET', '/artworks/1001/edit'],
  ['GET', '/artworks/search'],
  ['GET', '/artworks/preview'],
];

describe('보이는 방식 · 주조색 필드(#666)', () => {
  it.each(DISPLAY_APIS)(
    '전시 %s %s 응답에 posterFit · posterEdgeColor 가 있다',
    async (method, path, body) => {
      const { status, text } = await call(method, path, body);

      expect(status).toBeLessThan(300);
      for (const field of POSTER_FIELDS) expect(text).toContain(`"${field}"`);
    },
  );

  it.each(ARTWORK_APIS)('작품 %s %s 응답에 artworkFit 이 있다', async (method, path, body) => {
    const { status, text } = await call(method, path, body);

    expect(status).toBeLessThan(300);
    for (const field of ARTWORK_FIELDS) expect(text).toContain(`"${field}"`);
  });

  it('지도 마커에 posterFit · posterEdgeColor 가 있다', async () => {
    // 목 전시는 모두 끝나 지도에 안 나오므로 한 곳을 진행 중으로 바꾼다
    const display = mockDb.displays.find((item: { displayId: number }) => item.displayId === 101);
    display.period = { ...display.period, endDate: '2099-12-31' };

    const { status, text } = await call(
      'GET',
      '/display/map?all=true&southLatitude=33&westLongitude=124&northLatitude=39&eastLongitude=132',
    );

    expect(status).toBeLessThan(300);
    expect(JSON.parse(text).success.data.markers.length).toBeGreaterThan(0);
    for (const field of POSTER_FIELDS) expect(text).toContain(`"${field}"`);
  });

  it('생성에서 보이는 방식을 생략하면 FILL 로 저장한다', async () => {
    const display = await call('POST', '/display', DISPLAY_APIS[0][2]);
    expect(JSON.parse(display.text).success.data).toMatchObject({ posterFit: 'FILL' });

    const artwork = await call('POST', '/artworks', ARTWORK_BODY);
    expect(JSON.parse(artwork.text).success.data).toMatchObject({ artworkFit: 'FILL' });
  });

  it('목록 · 상세 응답의 보이는 방식은 null 이 아니다', async () => {
    const display = await call('GET', '/display/101');
    expect(JSON.parse(display.text).success.data.posterFit).toMatch(/^(FILL|FIT)$/);

    const artwork = await call('GET', '/artworks/1001');
    expect(JSON.parse(artwork.text).success.data.artworkFit).toMatch(/^(FILL|FIT)$/);
  });

  it('대표 포스터를 바꿔도 보이는 방식 · 가장자리 색은 유지하고 범위만 초기화한다', async () => {
    await call('PATCH', '/display', {
      displayId: 104,
      posterFit: 'FIT',
      posterEdgeColor: '#445566',
      posterCrop: { x: 0, y: 0, w: 0.5, h: 0.5 },
    });
    await call('PATCH', '/display', {
      displayId: 104,
      posterMedia: { imageUrl: 'https://x/new-poster.png', mediaType: 'IMAGE' },
    });

    const { text } = await call('GET', '/display/104');
    expect(JSON.parse(text).success.data).toMatchObject({
      posterFit: 'FIT',
      posterEdgeColor: '#445566',
      posterCrop: null,
    });
  });

  it('대표 사진을 바꿔도 작품 보이는 방식은 유지한다', async () => {
    await call('PATCH', '/artworks/1002', { ...ARTWORK_BODY, artworkFit: 'FIT' });
    await call('PATCH', '/artworks/1002', {
      ...ARTWORK_BODY,
      images: [{ imageUrl: 'https://x/new-artwork.png', mediaType: 'IMAGE', isThumbnail: true }],
    });

    const { text } = await call('GET', '/artworks/1002');
    expect(JSON.parse(text).success.data).toMatchObject({ artworkFit: 'FIT' });
  });

  it('전시 수정에서 필드를 생략하면 기존 값을 유지한다', async () => {
    await call('PATCH', '/display', {
      displayId: 102,
      posterFit: 'FIT',
      posterEdgeColor: '#112233',
    });
    await call('PATCH', '/display', { displayId: 102, title: '제목만 수정' });

    const { text } = await call('GET', '/display/102');
    expect(JSON.parse(text).success.data).toMatchObject({
      posterFit: 'FIT',
      posterEdgeColor: '#112233',
    });
  });
});
