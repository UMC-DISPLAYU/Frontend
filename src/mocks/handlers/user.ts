import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { noContent, paths, readJson, success } from '@/mocks/response';

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
    http.get(path, ({ request }) => {
      const nickname = new URL(request.url).searchParams.get('nickname') ?? '';

      return success('/api/v1/users/nickname/check', {
        nickname,
        available: nickname !== '중복닉네임',
        isAvailable: nickname !== '중복닉네임',
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
  ...paths('/api/v1/users/me/verification/email/send').map((path) =>
    http.post(path, () => noContent('/api/v1/users/me/verification/email/send')),
  ),
  ...paths('/api/v1/users/me/verification/email/confirm').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ schoolEmail?: string }>(request);
      mockDb.me.schoolEmail = body.schoolEmail ?? mockDb.me.schoolEmail;
      mockDb.me.isVerified = true;
      mockDb.me.isEmailVerified = true;

      return success('/api/v1/users/me/verification/email/confirm', {
        schoolEmail: mockDb.me.schoolEmail,
        isVerified: true,
      });
    }),
  ),
  ...paths('/api/v1/users/me/verification/email/resend').map((path) =>
    http.post(path, () => noContent('/api/v1/users/me/verification/email/resend')),
  ),
  /*
   * 스웨거 기준: 닉네임 부분 일치, 영문 대소문자 무시, 앞뒤 공백 제거,
   * 닉네임 → userId 오름차순 정렬, 최대 20명.
   * 본인(mockDb.me)은 초대 대상이 아니므로 결과에서 제외합니다.
   */
  ...paths('/api/v1/users/search').map((path) =>
    http.get(path, ({ request }) => {
      const keyword = (new URL(request.url).searchParams.get('nickname') ?? '').trim();

      if (!keyword) {
        return success('/api/v1/users/search', []);
      }

      const users = mockDb.searchableUsers
        .filter(
          (user: { userId: number; nickname: string }) =>
            user.userId !== mockDb.me.userId &&
            user.nickname.toLowerCase().includes(keyword.toLowerCase()),
        )
        .sort(
          (a: { userId: number; nickname: string }, b: { userId: number; nickname: string }) =>
            a.nickname.localeCompare(b.nickname) || a.userId - b.userId,
        )
        .slice(0, 20);

      return success('/api/v1/users/search', users);
    }),
  ),
  ...paths('/api/v1/schools').map((path) =>
    http.get(path, ({ request }) => {
      const keyword = new URL(request.url).searchParams.get('keyword') ?? '';
      const schools = ['홍익대학교', '중앙대학교', '서울대학교', '이화여자대학교', '국민대학교']
        .filter((name) => !keyword || name.includes(keyword))
        .map((name, index) => ({ schoolId: index + 1, id: index + 1, name }));

      return success('/api/v1/schools', { schools });
    }),
  ),
];
