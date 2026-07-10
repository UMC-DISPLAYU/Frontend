import { useEffect,useState } from 'react';

import ExhibitionIcon from '../assets/exhibit.svg';
import AvatarImage from '../assets/Icon (1).svg';
import SchoolIcon from '../assets/image 3666.svg';
import FieldIcon from '../assets/image 3673.svg';

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
  isArtistVerified: boolean;
  profile: UserProfile;
}

// Mock API 함수 - 나중에 실제 API 호출로 교체
const fetchUserProfile = async (): Promise<UserProfileResponse> => {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/api/user/profile');
  // return response.json();

  // Mock: 작가 인증된 사용자 데이터
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        isArtistVerified: true, // false로 변경하면 일반 사용자 UI
        profile: {
          name: '김지원 님',
          avatar: AvatarImage,
          // 작가 인증된 경우 (isArtistVerified: true)
          school: '중앙대학교',
          schoolIcon: SchoolIcon,
          field: '회화 · 일러스트',
          fieldIcon: FieldIcon,
          exhibit: '4',
          exhibitionIcon: ExhibitionIcon,
          bio: '빛과 색의 경계를 탐구하며, 일상에서 발견한 순간들을 작품으로 표현합니다.',
          portfolioUrl: 'portfolio.sangjun.com',
          caption: '내가 저장한 작품 확인하기', // 일반 뷰로 전환했을 때 사용
        },
      });
    }, 300);
  });
};

export function useUserProfile() {
  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await fetchUserProfile();
        if (!cancelled) {
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
