import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { created, paths, readJson, success } from '@/mocks/response';

type MockArtistProfile = {
  artistId: number;
  userId: number;
  artistName: string;
  nickname: string;
  profileImageUrl: string | null;
  introduction?: string;
  activityFields: string[];
  fields: string[];
  status: string;
};

let myArtistProfile: MockArtistProfile = {
  artistId: 1,
  userId: mockDb.me.userId,
  artistName: mockDb.me.nickname,
  nickname: mockDb.me.nickname,
  profileImageUrl: mockDb.me.profileImageUrl,
  introduction: '전시와 작품을 기록하는 작가 프로필입니다.',
  activityFields: ['회화'],
  fields: ['회화'],
  status: 'ACTIVE',
};

export const artistHandlers = [
  ...paths('/api/v1/artists/me/artist-profile').map((path) =>
    http.get(path, () => success('/api/v1/artists/me/artist-profile', myArtistProfile)),
  ),
  ...paths('/api/v1/artists/me/artist-profile').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<Partial<MockArtistProfile>>(request);
      myArtistProfile = {
        artistId: 1,
        userId: mockDb.me.userId,
        artistName: body.artistName ?? mockDb.me.nickname,
        nickname: mockDb.me.nickname,
        profileImageUrl: mockDb.me.profileImageUrl,
        introduction: body.introduction ?? '',
        activityFields: body.activityFields ?? [],
        fields: body.fields ?? body.activityFields ?? [],
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
