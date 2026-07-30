import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { refreshToken } from '@/api/endpoints';
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

export const Homepage = () => {
  const [isArtworkPreviewOpen, setIsArtworkPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: duPicksData } = useDuPicks();
  const { data: graduationExhibitions = [] } = useGraduationDisplays();
  const { data: closingSoonData } = useClosingSoonDisplays({ size: 3 });
  const { data: artworkPreviewData } = useHomeArtworkPreview();
  const { data: loungePostsData } = useHomeLoungePosts();
  const closingSoonExhibitions = closingSoonData?.exhibitions ?? [];
  const artworkPreviewItems = artworkPreviewData?.artworks ?? [];

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams]);

  // OAuth 콜백 이후 refreshToken 쿠키만 있고 accessToken이 없는 상태(기존 회원)일 수 있어서,
  // 홈 진입 시 accessToken이 없으면 1회 재발급을 시도한다.
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      return;
    }

    void refreshToken()
      .then(({ accessToken }) => {
        localStorage.setItem('accessToken', accessToken);
      })
      .catch(() => {
        // 비회원/게스트일 수 있으므로 조용히 무시 (refresh token 쿠키 자체가 없는 경우)
      });
  }, []);

  if (isArtworkPreviewOpen) {
    return <ArtworkPreviewMoreView items={artworkPreviewItems} />;
  }

  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 font-[Pretendard,sans-serif]">
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
