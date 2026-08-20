import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { refreshToken } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import displayuLogo from '@/assets/brand/DUfontlogo.svg';
import duPick1 from '@/assets/dupick/dupick1.png';
import duPick2 from '@/assets/dupick/dupick2.png';
import duPick3 from '@/assets/dupick/dupick3.png';
import { ArtworkPreviewMoreView } from '@/components/homepage/ArtworkPreviewMoreView';
import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { DuPickHtmlView } from '@/components/homepage/DuPickHtmlView';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';
import {
  useClosingSoonDisplays,
  useGraduationDisplays,
  useHomeArtworkPreview,
  useHomeLoungePosts,
} from '@/hooks/queries/useHome';
import {
  useArtistVerificationRequiredModal,
  useLoginRequiredModal,
} from '@/hooks/usePermissionRequiredModal';
import { useDisplayCreatePolicy } from '@/hooks/usePolicy';
import { useAuthStore } from '@/stores/authStore';
import type { DuPickItem } from '@/types/exhibition';
import { hasPermission } from '@/utils/hasPermission';

const staticDuPicks: DuPickItem[] = [
  {
    id: 1,
    title: '정해진 형태에서 벗어나는 법',
    date: '디유대학교 공간디자인 학생들이 다시 정의한 공간의 경계',
    location: '',
    bannerImageUrl: duPick1,
  },
  {
    id: 2,
    title: '잘 만든 것보다, 내가 만든 것',
    date: '평가받기 위한 작업과 내가 정말 만들고 싶은 것 사이에서',
    location: '',
    bannerImageUrl: duPick2,
  },
  {
    id: 3,
    title: '디유를 만든 사람들의 이야기',
    date: '디유가 지금의 모습이 되기까지의 과정',
    location: '',
    bannerImageUrl: duPick3,
  },
];

const duPickHtmlById: Record<string, string> = {
  '1': '/dupick/dupick1.html',
  '2': '/dupick/dupick2.html',
  '3': '/dupick/dupick3.html',
};

interface SelectedDuPick {
  id: string;
  title: string;
}

export const Homepage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDuPick, setSelectedDuPick] = useState<SelectedDuPick | null>(null);
  const [isDuPickClosing, setIsDuPickClosing] = useState(false);
  const isArtworkPreviewOpen = searchParams.get('view') === 'artwork-preview';
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { data: graduationExhibitions = [] } = useGraduationDisplays();
  const { data: closingSoonData } = useClosingSoonDisplays({ size: 3 });
  const { data: artworkPreviewData } = useHomeArtworkPreview();
  const { data: loungePostsData } = useHomeLoungePosts();
  const closingSoonExhibitions = closingSoonData?.exhibitions ?? [];
  const artworkPreviewItems = artworkPreviewData?.artworks ?? [];

  const { artistVerificationModal, openArtistVerificationModal } =
    useArtistVerificationRequiredModal();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const displayCreatePolicy = useDisplayCreatePolicy();
  const canCreateDisplay = hasPermission(displayCreatePolicy, 'create');

  const handlePlusClick = () => {
    if (canCreateDisplay) {
      navigate('/exhibition/register');
      return;
    }

    if (accessToken) {
      openArtistVerificationModal();
      return;
    }

    openLoginModal();
  };

  const closeDuPick = () => {
    setIsDuPickClosing(true);
    window.setTimeout(() => {
      setSelectedDuPick(null);
      setIsDuPickClosing(false);
    }, 300);
  };

  useEffect(() => {
    const token = searchParams.get('accessToken');

    if (token) {
      setAccessToken(token);
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams, setAccessToken]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (accessToken) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.archives.all });
    }
  }, [accessToken, queryClient]);

  // OAuth 콜백 이후 refreshToken 쿠키만 있고 accessToken이 없는 상태(기존 회원)일 수 있어서,
  // 홈 진입 시 accessToken이 없으면 1회 재발급을 시도한다.
  useEffect(() => {
    if (accessToken) {
      return;
    }

    void refreshToken()
      .then(({ accessToken: newAccessToken }) => {
        setAccessToken(newAccessToken);
      })
      .catch(() => {
        // 비회원/게스트일 수 있으므로 조용히 무시 (refresh token 쿠키 자체가 없는 경우)
      });
  }, [accessToken, setAccessToken]);

  if (isArtworkPreviewOpen) {
    return (
      <ArtworkPreviewMoreView
        onClose={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.delete('view');
              return next;
            });
          }
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5">
      {loginModal}
      {artistVerificationModal}

      {/* Homepage Header */}
      <div className="relative px-5 w-full flex justify-between items-center mb-6 h-8">
        <button
          type="button"
          className="flex size-7 items-center justify-center cursor-pointer relative z-10"
          aria-label="전시 등록"
          onClick={handlePlusClick}
        >
          <Plus className="size-8 text-main" strokeWidth={1.8} />
        </button>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <img
            src={displayuLogo}
            alt="Display U"
            className="h-7 w-auto object-contain pointer-events-auto"
          />
        </div>

        <button
          type="button"
          className="flex size-8 items-center justify-center cursor-pointer relative z-10"
          aria-label="검색"
          onClick={() => navigate('/search')}
        >
          <Search className="size-5.5 text-main" strokeWidth={2} />
        </button>
      </div>

      <DuPickBanner
        items={staticDuPicks}
        onItemClick={(item) => {
          const id = 'duPickId' in item ? item.duPickId : item.id;
          setIsDuPickClosing(false);
          setSelectedDuPick({ id: String(id), title: item.title });
        }}
      />
      <ExhibitionSection
        title="졸업전시"
        items={graduationExhibitions}
        linkTo="/search?type=졸업 전시"
      />
      <ExhibitionSection
        title="놓치기 전에 볼 전시"
        items={closingSoonExhibitions}
        linkTo="/search?status=종료예정"
      />
      <ArtworkPreviewSection
        items={artworkPreviewItems}
        onMoreClick={() => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('view', 'artwork-preview');
            return next;
          });
        }}
      />
      <LoungeSection posts={loungePostsData?.posts ?? []} />
      {selectedDuPick?.id && duPickHtmlById[String(selectedDuPick.id)] && (
        <DuPickHtmlView
          htmlSrc={duPickHtmlById[String(selectedDuPick.id)]}
          title={selectedDuPick.title}
          isClosing={isDuPickClosing}
          onBack={closeDuPick}
        />
      )}
    </div>
  );
};
