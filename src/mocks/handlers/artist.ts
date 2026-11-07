import { delay, http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { created, fail, paths, readJson, success } from '@/mocks/response';

type MockArtistProfile = {
  artistId: number;
  artistProfileId: number;
  userId: number;
  artistName: string;
  nickname: string;
  profileImageUrl: string | null;
  schoolEmail: string;
  univName: string;
  introduction?: string;
  activityFields: string[];
  fields: string[];
  isVerified: boolean;
  status: string;
};

let myArtistProfile: MockArtistProfile = {
  artistId: 1,
  artistProfileId: 1,
  userId: mockDb.me.userId,
  artistName: mockDb.me.nickname,
  nickname: mockDb.me.nickname,
  profileImageUrl: mockDb.me.profileImageUrl,
  schoolEmail: mockDb.me.schoolEmail,
  univName: mockDb.me.school,
  introduction: '전시와 작품을 기록하는 작가 프로필입니다.',
  activityFields: ['회화'],
  fields: ['회화'],
  isVerified: mockDb.me.isVerified,
  status: 'ACTIVE',
};

export const artistHandlers = [
  ...paths('/api/v1/artists/me/artist-profile').map((path) =>
    http.get(path, () => success('/api/v1/artists/me/artist-profile', myArtistProfile)),
  ),
  ...paths('/api/v1/artists/me/artist-profile').map((path) =>
    http.post(path, async ({ request }) => {
      await delay(600);
      const body = await readJson<Partial<MockArtistProfile>>(request);

      // 가짜 API: 저장 실패 문구를 확인할 수 있게 '중복작가'는 이미 쓰는 이름으로 처리합니다.
      if (body.artistName?.trim() === '중복작가') {
        return fail(
          '/api/v1/artists/me/artist-profile',
          409,
          'DUPLICATE_ARTIST_NAME',
          '이미 사용 중인 작가 프로필명입니다.',
        );
      }

      myArtistProfile = {
        artistId: 1,
        artistProfileId: 1,
        userId: mockDb.me.userId,
        artistName: body.artistName ?? mockDb.me.nickname,
        nickname: mockDb.me.nickname,
        profileImageUrl: mockDb.me.profileImageUrl,
        schoolEmail: mockDb.me.schoolEmail,
        univName: mockDb.me.school,
        introduction: body.introduction ?? '',
        activityFields: body.activityFields ?? [],
        fields: body.fields ?? body.activityFields ?? [],
        isVerified: true,
        status: 'ACTIVE',
      };
      mockDb.me.isVerified = true;

      return created('/api/v1/artists/me/artist-profile', myArtistProfile);
    }),
  ),
  ...paths('/api/v1/artists/me/artist-profile').map((path) =>
    http.patch(path, async ({ request }) => {
      myArtistProfile = {
        ...myArtistProfile,
        ...(await readJson<Partial<MockArtistProfile>>(request)),
      };

      return success('/api/v1/artists/me/artist-profile', myArtistProfile);
    }),
  ),
];
