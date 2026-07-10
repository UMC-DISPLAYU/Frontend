import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';
import {
  ARTWORK_ITEMS,
  DEADLINE_EXHIBITIONS,
  DU_PICK_ITEMS,
  GRADUATION_EXHIBITIONS,
  LOUNGE_POSTS,
} from '@/mocks/exhibition';

export const Homepage = () => {
  return (
    <div className="w-full max-w-105 mx-auto bg-white min-h-dvh overflow-x-hidden pt-2.5 pb-10 font-[Pretendard,sans-serif]">
      <DuPickBanner items={DU_PICK_ITEMS} />
      <ExhibitionSection title="졸업전시" items={GRADUATION_EXHIBITIONS} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={DEADLINE_EXHIBITIONS} />
      <ArtworkPreviewSection items={ARTWORK_ITEMS} />
      <LoungeSection posts={LOUNGE_POSTS} />
    </div>
  );
};
