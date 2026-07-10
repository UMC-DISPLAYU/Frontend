import { useEffect, useState } from 'react';

import type { HomeExhibitionDto } from '@/api/dto';
import { getGraduationDisplays } from '@/api/endpoints';
import { ArtworkPreviewSection } from '@/components/homepage/ArtworkPreviewSection';
import { DuPickBanner } from '@/components/homepage/DuPickBanner';
import { ExhibitionSection } from '@/components/homepage/ExhibitionSection';
import { LoungeSection } from '@/components/homepage/LoungeSection';
import {
  ARTWORK_ITEMS,
  DEADLINE_EXHIBITIONS,
  DU_PICK_ITEMS,
  LOUNGE_POSTS,
} from '@/mocks/exhibition';
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

  useEffect(() => {
    const fetchGraduationDisplays = async () => {
      const exhibitions = await getGraduationDisplays();

      setGraduationExhibitions(exhibitions.map(toExhibitionCard));
    };

    void fetchGraduationDisplays();
  }, []);

  return (
    <div className="w-full max-w-105 mx-auto bg-white min-h-dvh overflow-x-hidden pt-2.5 pb-10 font-[Pretendard,sans-serif]">
      <DuPickBanner items={DU_PICK_ITEMS} />
      <ExhibitionSection title="졸업전시" items={graduationExhibitions} />
      <ExhibitionSection title="놓치기 전에 볼 전시" items={DEADLINE_EXHIBITIONS} />
      <ArtworkPreviewSection items={ARTWORK_ITEMS} />
      <LoungeSection posts={LOUNGE_POSTS} />
    </div>
  );
};
