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
  schoolName: string;
  introduction: string | null;
  externalLink: string | null;
  instagramLink: string | null;
  activityFields: string[];
  fields: string[];
  isVerified: boolean;
  status: string;
};

const MOCK_ARTIST_PHOTO =
  'https://d1tdgnysscm2va.cloudfront.net/images/display/2026/08/f0fe3b7d-8e11-453f-bb18-0edd41ef54cd-026-image.png';

type UpdateArtistProfileBody = Pick<
  MockArtistProfile,
  'profileImageUrl' | 'artistName' | 'introduction' | 'fields' | 'externalLink' | 'instagramLink'
>;

const toPublicProfile = (profile: MockArtistProfile) => ({
  artistName: profile.artistName,
  schoolName: profile.schoolName,
  profileImageUrl: profile.profileImageUrl,
  introduction: profile.introduction,
  externalLink: profile.externalLink,
  instagramLink: profile.instagramLink,
  fields: profile.fields,
});

let myArtistProfile: MockArtistProfile = {
  artistId: 1,
  artistProfileId: 1,
  userId: mockDb.me.userId,
  artistName: mockDb.me.nickname,
  nickname: mockDb.me.nickname,
  profileImageUrl: MOCK_ARTIST_PHOTO,
  schoolEmail: mockDb.me.schoolEmail,
  univName: mockDb.me.school,
  schoolName: mockDb.me.school,
  introduction: '전시와 작품을 기록하는 작가 프로필입니다.',
  externalLink: 'https://displayu.kr',
  instagramLink: 'https://instagram.com/displayu_mock',
  activityFields: ['PAINTING'],
  fields: ['PAINTING'],
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
        schoolName: mockDb.me.school,
        introduction: body.introduction ?? '',
        externalLink: null,
        instagramLink: null,
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
      const body = await readJson<UpdateArtistProfileBody>(request);
      // 실서버처럼 요청 전체로 덮어쓴다. 빠진 사진 · 소개 · 링크는 지워진다
      myArtistProfile = {
        ...myArtistProfile,
        artistName: body.artistName ?? myArtistProfile.artistName,
        fields: body.fields ?? myArtistProfile.fields,
        profileImageUrl: body.profileImageUrl ?? null,
        introduction: body.introduction ?? null,
        externalLink: body.externalLink ?? null,
        instagramLink: body.instagramLink ?? null,
      };

      return success('/api/v1/artists/me/artist-profile', myArtistProfile);
    }),
  ),
  ...paths('/api/v1/artists/{userId}/artist-profile').map((path) =>
    http.get(path, ({ params }) => {
      const userId = Number(params.userId);
      const profile =
        userId === mockDb.me.userId
          ? myArtistProfile
          : { ...myArtistProfile, artistName: `작가${userId}`, instagramLink: null };

      return success('/api/v1/artists/{userId}/artist-profile', toPublicProfile(profile));
    }),
  ),
];
