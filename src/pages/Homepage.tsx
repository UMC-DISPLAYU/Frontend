import { useEffect, useState } from 'react';

import type {
  ArtworkPreviewItemDto,
  DuPickDto,
  HomeExhibitionDto,
  LoungePostSummaryDto,
} from '@/api/dto';
import {
  getArtworkPreview,
  getClosingSoonDisplays,
  getDuPicks,
  getGraduationDisplays,
  getLoungePosts,
} from '@/api/endpoints';
import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';

export const Homepage = () => {
  const [duPickItems, setDuPickItems] = useState<DuPickDto[]>([]);
  const [graduationExhibitions, setGraduationExhibitions] = useState<HomeExhibitionDto[]>([]);
  const [closingSoonExhibitions, setClosingSoonExhibitions] = useState<HomeExhibitionDto[]>([]);
  const [previewArtworks, setPreviewArtworks] = useState<ArtworkPreviewItemDto[]>([]);
  const [loungePosts, setLoungePosts] = useState<LoungePostSummaryDto[]>([]);

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

    const fetchClosingSoonDisplays = async () => {
      try {
        const exhibitions = await getClosingSoonDisplays();
        if (isMounted) {
          setClosingSoonExhibitions(exhibitions);
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

    const fetchLoungePosts = async () => {
      try {
        const data = await getLoungePosts({ size: 3 });
        if (isMounted) {
          setLoungePosts(data.posts);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    };

    void fetchGraduationDisplays();
    void fetchDuPicks();
    void fetchClosingSoonDisplays();
    void fetchPreviewArtworks();
    void fetchLoungePosts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 font-[Pretendard,sans-serif]">
      <DuPickBanner items={duPickItems} />
      <ExhibitionSection title="졸업전시" items={graduationExhibitions} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={closingSoonExhibitions} />
      <ArtworkPreviewSection items={previewArtworks} />
      <LoungeSection posts={loungePosts} />
    </div>
  );
};
