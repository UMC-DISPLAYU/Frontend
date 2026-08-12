import { useEffect, useState } from 'react';

import { getMyArtistProfile } from '@/api/endpoints/artist';
import { getUserMe } from '@/api/endpoints/user';
import AvatarImage from '@/assets/mypage/Icon (1).svg';
import { EXHIBITION_FIELD_LABELS, type ExhibitionField } from '@/constants/exhibition';

export interface UserProfile {
  name: string;
  avatar: string;
  school?: string;
  fields?: string[];
  exhibitionCount?: string;
  artworkCount?: string;
  bio?: string;
  portfolioUrl?: string;
  caption?: string;
}

export interface UserProfileResponse {
  id: number;
  isArtistVerified: boolean;
  profile: UserProfile;
}

export function useUserProfile() {
  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);

        // 기본 사용자 정보 가져오기
        const userMe = await getUserMe();

        // 작가 인증 여부 확인 후 작가 프로필 가져오기
        let artistProfile = null;
        if (userMe.isVerified) {
          try {
            artistProfile = await getMyArtistProfile();
          } catch (err) {
            // 404: 작가 프로필이 아직 생성되지 않음 (정상 케이스)
            if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
              // eslint-disable-next-line no-console
              console.warn('Artist profile not found (404)');
            } else {
              // 네트워크 에러나 5xx 에러는 상위로 전파
              throw err;
            }
          }
        }

        if (!cancelled) {
          const profileData: UserProfileResponse = {
            id: userMe.id,
            isArtistVerified: userMe.isVerified,
            profile: {
              name: `${userMe.name} 님`,
              avatar: AvatarImage, // TODO: 실제 프로필 이미지 URL
              school: artistProfile?.schoolName,
              fields:
                artistProfile?.fields.map(
                  (code) => EXHIBITION_FIELD_LABELS[code as ExhibitionField] ?? code,
                ) ?? [],
              exhibitionCount: undefined, // TODO: 전시 수 API 연동 필요
              artworkCount: undefined, // TODO: 작품 수 API 연동 필요
              bio: undefined, // TODO: bio API 필드 추가 필요
              portfolioUrl: artistProfile?.portfolioUrl || undefined,
              caption: '내가 저장한 작품 확인하기',
            },
          };

          setData(profileData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
