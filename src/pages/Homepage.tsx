import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

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
      return;
    }
  }, [navigate, searchParams]);

  if (isArtworkPreviewOpen) {
    return <ArtworkPreviewMoreView items={artworkPreviewItems} />;
  }

  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 font-[Pretendard,sans-serif]">
      <DuPickBanner items={duPicksData?.duPicks ?? []} />
      <ExhibitionSection title="졸업전시" items={graduationExhibitions} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={closingSoonExhibitions} />
      <ArtworkPreviewSection
        items={artworkPreviewItems}
        onMoreClick={() => setIsArtworkPreviewOpen(true)}
      />
      <LoungeSection posts={loungePostsData?.posts ?? []} />
    </div>
  );
};
