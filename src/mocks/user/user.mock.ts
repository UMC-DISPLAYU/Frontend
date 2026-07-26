import type { ArtistProfileDto, UserProfileDto } from '@/api/dto';
import { MOCK_PROFILE_IMAGES } from '@/mocks/data';

export const mockUserMe: UserProfileDto = {
  id: 9001,
  provider: 'Kakao',
  name: '윤서하',
  nickname: '서하의 작업실',
  isVerified: true,
  socialEmail: 'seohah.yoon@example.com',
  schoolEmail: 'seohah@cau.ac.kr',
};

export const mockMyArtistProfile: ArtistProfileDto = {
  artistName: '윤서하',
  profileImageUrl: MOCK_PROFILE_IMAGES[0].imageUrl,
  introduction:
    '빛이 닿은 표면과 관람자의 이동 경로가 서로를 바꾸는 순간을 기록합니다. 회화와 설치를 오가며, 일상적인 장면이 낯선 풍경으로 바뀌는 지점을 다룹니다.',
  status: 'APPROVED',
  schoolName: '중앙대학교',
  externalLink: 'portfolio.seoian.kr',
  fields: ['회화', '설치', '미디어'],
};
