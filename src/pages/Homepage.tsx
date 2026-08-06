import { useEffect, useState } from 'react';

import { Plus, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { refreshToken } from '@/api/endpoints';
import displayuLogo from '@/assets/brand/DUfontlogo.svg';
import { ArtworkPreviewMoreView } from '@/components/homepage/ArtworkPreviewMoreView';
import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';
import {
  useClosingSoonDisplays,
  useDuPicks,
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
import { hasPermission } from '@/utils/hasPermission';

export const Homepage = () => {
  const [isArtworkPreviewOpen, setIsArtworkPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { data: duPicksData } = useDuPicks();
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
      navigate('/exhibition-register');
      return;
    }

    if (accessToken) {
      openArtistVerificationModal();
      return;
    }

    openLoginModal();
  };

  useEffect(() => {
    const token = searchParams.get('accessToken');

    if (token) {
      setAccessToken(token);
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams, setAccessToken]);

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
        items={artworkPreviewItems}
        onClose={() => setIsArtworkPreviewOpen(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 pb-20 font-[Pretendard,sans-serif]">
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

      <DuPickBanner items={duPicksData?.duPicks ?? []} />
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
        onMoreClick={() => setIsArtworkPreviewOpen(true)}
      />
      <LoungeSection posts={loungePostsData?.posts ?? []} />
    </div>
  );
};
