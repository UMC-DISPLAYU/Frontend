import ExhibitionIcon from '@/assets/exhibit.svg';
import AvatarImage from '@/assets/Icon (1).svg';
import SchoolIcon from '@/assets/image 3666.svg';
import FieldIcon from '@/assets/image 3673.svg';
import type { ArtistProfile } from '@/types/mypage';

export const AUTH_PAGE_PROFILE: ArtistProfile = {
  name: '김지원 님',
  isVerified: true,
  avatar: AvatarImage,
  school: '중앙대학교',
  schoolIcon: SchoolIcon,
  field: '회화 · 일러스트',
  fieldIcon: FieldIcon,
  exhibit: '4',
  exhibitionIcon: ExhibitionIcon,
  bio: '빛과 색의 경계를 탐구하며, 일상에서 발견한 순간들을 작품으로 표현합니다.',
  portfolioUrl: 'portfolio.sangjun.com',
};
