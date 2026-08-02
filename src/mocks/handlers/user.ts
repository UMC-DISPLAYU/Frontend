import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { noContent, paths, readJson, success } from '@/mocks/response';

const userArtistProfile = (userId = 1) => ({
  artistId: userId,
  userId,
  nickname: userId === 1 ? mockDb.me.nickname : `작가 ${userId}`,
  profileImageUrl: mockDb.me.profileImageUrl,
  introduction: '전시와 작품을 기록하는 작가 프로필입니다.',
  instagram: '@displayu_mock',
  status: 'ACTIVE',
});

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
