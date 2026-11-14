import { delay, http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { fail, noContent, paths, readJson, success } from '@/mocks/response';
import { MOCK_DELAY_MS, MOCK_NICKNAMES } from '@/mocks/scenario';

/* 작품에 부여한 artistUserId(300번대)로 조회하면 해당 작품의 작가 정보를 돌려줍니다. */
const findArtworkArtist = (userId: number) =>
  (mockDb.artworks as { artistUserId?: number; artistName?: string }[]).find(
    (artwork) => artwork.artistUserId === userId,
  );

const userArtistProfile = (userId = 1) => {
  const artwork = findArtworkArtist(userId);
  const artistName = userId === mockDb.me.userId ? mockDb.me.nickname : (artwork?.artistName ?? '');

  return {
    artistId: userId,
    userId,
    artistName,
    nickname: artistName,
    profileImageUrl: mockDb.me.profileImageUrl,
    schoolName: '홍익대학교 시각디자인과',
    introduction: '전시와 작품을 기록하는 작가 프로필입니다.',
    instagram: '@displayu_mock',
    fields: ['회화', '일러스트'],
    status: 'ACTIVE',
  };
};

export const userHandlers = [
  ...paths('/api/v1/users/me').map((path) =>
    http.get(path, () => success('/api/v1/users/me', mockDb.me)),
  ),
  ...paths('/api/v1/users/me').map((path) =>
    http.patch(path, async ({ request }) => {
      Object.assign(mockDb.me, await readJson(request));

      return success('/api/v1/users/me', mockDb.me);
    }),
  ),
  ...paths('/api/v1/users/me').map((path) =>
    http.delete(path, () => noContent('/api/v1/users/me')),
  ),
  ...paths('/api/v1/users/me/nickname').map((path) =>
    http.patch(path, async ({ request }) => {
      const body = await readJson<{ nickname?: string }>(request);
      mockDb.me.nickname = body.nickname ?? mockDb.me.nickname;

      return success('/api/v1/users/me/nickname', { nickname: mockDb.me.nickname });
    }),
  ),
  ...paths('/api/v1/users/nickname/check').map((path) =>
    http.get(path, async ({ request }) => {
      const nickname = new URL(request.url).searchParams.get('nickname') ?? '';

      if (nickname === MOCK_NICKNAMES.checkSlow) await delay(MOCK_DELAY_MS);
      if (nickname === MOCK_NICKNAMES.checkFail) {
        return fail(
          '/api/v1/users/nickname/check',
          500,
          'INTERNAL_SERVER_ERROR',
          '닉네임 중복 확인에 실패했습니다.',
        );
      }

      const isAvailable = nickname !== MOCK_NICKNAMES.duplicate;
      return success('/api/v1/users/nickname/check', {
        nickname,
        available: isAvailable,
        isAvailable,
      });
    }),
  ),
  // 가짜 API: 작가 인증 화면에서 내 작가 프로필 기본값을 확인하기 위해 사용합니다.
  ...paths('/api/v1/users/me/artist-profile').map((path) =>
    http.get(path, () => success('/api/v1/users/me/artist-profile', userArtistProfile())),
  ),
  // 가짜 API: 작가 인증 화면에서 내 작가 프로필 수정 흐름을 확인하기 위해 사용합니다.
  ...paths('/api/v1/users/me/artist-profile').map((path) =>
    http.patch(path, async ({ request }) =>
      success('/api/v1/users/me/artist-profile', {
        ...userArtistProfile(),
        ...(await readJson(request)),
      }),
    ),
  ),
  ...paths('/api/v1/users/{userId}/artist-profile').map((path) =>
    http.get(path, ({ params }) =>
      success('/api/v1/users/{userId}/artist-profile', userArtistProfile(Number(params.userId))),
    ),
  ),
  /*
   * 스웨거 기준: 닉네임이 정확히 일치하는 사용자 한 명을 돌려주고, 없으면 404 USER_NICKNAME_NOT_FOUND.
   * 본인도 검색된다(팀원 관리 화면에서 `참여 중`으로 보인다).
   */
  ...paths('/api/v1/users/search').map((path) =>
    http.get(path, ({ request }) => {
      const keyword = (new URL(request.url).searchParams.get('nickname') ?? '').trim();
      const user = [mockDb.me, ...mockDb.searchableUsers].find(
        (candidate: { nickname: string }) => candidate.nickname === keyword,
      );

      if (!keyword || !user) {
        return fail(
          '/api/v1/users/search',
          404,
          'USER_NICKNAME_NOT_FOUND',
          '해당 닉네임을 가진 사용자를 찾을 수 없습니다.',
        );
      }

      return success('/api/v1/users/search', {
        userId: user.userId,
        name: user.name,
        nickname: user.nickname,
      });
    }),
  ),
];
