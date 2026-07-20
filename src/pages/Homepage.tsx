import { useEffect, useState } from 'react';

import type { ArtworkPreviewItemDto, DuPickDto, HomeExhibitionDto } from '@/api/dto';
import { getArtworkPreview, getDuPicks, getGraduationDisplays } from '@/api/endpoints';
import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';
import { DEADLINE_EXHIBITIONS, LOUNGE_POSTS } from '@/mocks/exhibition';

export const Homepage = () => {
  ///v1/display/graduation 엔드포인트 연결
  //일단은 훅 없이 그대로 가져왔으니 나중에 최적화할 때 참고하세요
  const [graduationExhibitions, setGraduationExhibitions] = useState<HomeExhibitionDto[]>([]);
  const [duPickItems, setDuPickItems] = useState<DuPickDto[]>([]);
  const [previewArtworks, setPreviewArtworks] = useState<ArtworkPreviewItemDto[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchGraduationDisplays = async () => {
      try {
        const exhibitions = await getGraduationDisplays({ size: 3 });
        if (isMounted) {
          setGraduationExhibitions(exhibitions);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    const fetchDuPicks = async () => {
      try {
        const data = await getDuPicks({ cursor: 1, size: 4 });
        if (isMounted) {
          setDuPickItems(data.duPicks);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    const fetchPreviewArtworks = async () => {
      try {
        const data = await getArtworkPreview({ type: 'RECOMMEND', page: 0, size: 10 });
        if (isMounted) {
          setPreviewArtworks(data.artworks);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    void fetchGraduationDisplays();
    void fetchDuPicks();
    void fetchPreviewArtworks();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 font-[Pretendard,sans-serif]">
      <DuPickBanner items={duPickItems} />
      <ExhibitionSection title="졸업전시" items={graduationExhibitions} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={DEADLINE_EXHIBITIONS} />
      <ArtworkPreviewSection items={previewArtworks} />
      <LoungeSection posts={LOUNGE_POSTS} />
    </div>
  );
};
