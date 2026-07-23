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
  const { data: duPicksData } = useDuPicks();
  const { data: graduationExhibitions = [] } = useGraduationDisplays();
  const { data: closingSoonExhibitions = [] } = useClosingSoonDisplays();
  const { data: artworkPreviewData } = useHomeArtworkPreview();
  const { data: loungePostsData } = useHomeLoungePosts();

  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 font-[Pretendard,sans-serif]">
      <DuPickBanner items={duPicksData?.duPicks ?? []} />
      <ExhibitionSection title="졸업전시" items={graduationExhibitions} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={closingSoonExhibitions} />
      <ArtworkPreviewSection items={artworkPreviewData?.artworks ?? []} />
      <LoungeSection posts={loungePostsData?.posts ?? []} />
    </div>
  );
};
