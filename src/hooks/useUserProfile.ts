import ExhibitionIcon from '../assets/exhibit.svg';
import SchoolIcon from '../assets/image 3666.svg';
import FieldIcon from '../assets/image 3673.svg';

import { useMyArtistProfile, useUserMe } from './queries/useUserProfile';

export interface UserProfile {
  name: string;
  avatar: string;
  school?: string;
  schoolIcon?: string;
  field?: string;
  fieldIcon?: string;
  exhibit?: string;
  exhibitionIcon?: string;
  bio?: string;
  portfolioUrl?: string;
  caption?: string;
}

export interface UserProfileResponse {
  userId: number;
  isArtistVerified: boolean;
  profile: UserProfile;
}

export function useUserProfile() {
  const userQuery = useUserMe();
  const artistQuery = useMyArtistProfile();
  const user = userQuery.data;
  const artist = artistQuery.data;

  const profile: UserProfileResponse | null =
    user && artist
      ? {
          userId: user.id,
          isArtistVerified: user.isVerified,
          profile: {
            name: `${user.nickname} 님`,
            avatar: artist.profileImageUrl ?? '',
            school: artist.schoolName,
            schoolIcon: SchoolIcon,
            field: artist.fields.join(' · '),
            fieldIcon: FieldIcon,
            exhibit: '4',
            exhibitionIcon: ExhibitionIcon,
            bio: artist.introduction ?? undefined,
            portfolioUrl: artist.externalLink ?? undefined,
            caption: '내가 저장한 작품 확인하기',
          },
        }
      : null;

  return {
    data: profile,
    isLoading: userQuery.isLoading || artistQuery.isLoading,
    error: userQuery.error ?? artistQuery.error,
  };
}
