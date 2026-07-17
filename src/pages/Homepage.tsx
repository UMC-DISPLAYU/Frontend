import { useEffect, useState } from 'react';

import type { DuPickDto, HomeExhibitionDto } from '@/api/dto';
import { getDuPicks, getGraduationDisplays } from '@/api/endpoints';
import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';
import { ARTWORK_ITEMS, DEADLINE_EXHIBITIONS, LOUNGE_POSTS } from '@/mocks/exhibition';
import type { ExhibitionCardData } from '@/types/exhibition';

const SCHOOL_BY_DISPLAY_ID: Record<number, string> = {
  1: '중앙대학교 디자인학부',
  2: '홍익대학교 시각디자인',
  3: '홍익대학교 시각디자인',
};

const formatMonthDay = (date: string) => {
  const [, month, day] = date.split('-');

  return `${month}.${day}`;
};

const toExhibitionCard = (exhibition: HomeExhibitionDto): ExhibitionCardData => ({
  id: String(exhibition.displayId),
  title: exhibition.title,
  school: SCHOOL_BY_DISPLAY_ID[exhibition.displayId] ?? '',
  period: `${formatMonthDay(exhibition.startedAt)} - ${formatMonthDay(exhibition.endedAt)}`,
  thumbnail: exhibition.posterImageUrl,
});
//컴포넌트가 DTO에 맞춰야 하는데, 지금 여기서까지 건드는 건 과한 거 같아서 일단 두겠습니다.
//위 코드는 DTO를 ExhibitionCardData로 변환하는 함수입니다.
//나중에 컴포넌트 꼭 수정해주세요

export const Homepage = () => {
  ///v1/display/graduation 엔드포인트 연결
  //일단은 훅 없이 그대로 가져왔으니 나중에 최적화할 때 참고하세요
  const [graduationExhibitions, setGraduationExhibitions] = useState<ExhibitionCardData[]>([]);
  const [duPickItems, setDuPickItems] = useState<DuPickDto[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchGraduationDisplays = async () => {
      try {
        const exhibitions = await getGraduationDisplays();
        if (isMounted) {
          setGraduationExhibitions(exhibitions.map(toExhibitionCard));
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

    void fetchGraduationDisplays();
    void fetchDuPicks();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full max-w-105 mx-auto bg-page min-h-dvh overflow-x-hidden pt-2.5 font-[Pretendard,sans-serif]">
      <DuPickBanner items={duPickItems} />
      <ExhibitionSection title="졸업전시" items={graduationExhibitions} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={DEADLINE_EXHIBITIONS} />
      <ArtworkPreviewSection items={ARTWORK_ITEMS} />
      <LoungeSection posts={LOUNGE_POSTS} />
    </div>
  );
};
