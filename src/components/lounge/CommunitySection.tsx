import { ArrowUpRight } from 'lucide-react';

import loungeReviewThumbnail from '@/assets/LoungeReviewThumbnail.svg';
import loungeVenueThumbnail from '@/assets/LoungeVenueThumbnail.svg';

import { LoungeCard } from './LoungeCard';

const TIP_CARDS = [
  { title: '전시 준비·작업 팁', description: '전시 준비 과정과\n작업 노하우를 공유해요' },
  { title: '모집·협업', description: '전시 준비 과정과\n작업 노하우를 공유해요' },
];

function MultilineText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, index) => (
        <span key={line}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

export function CommunitySection() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-3.5">
        <LoungeCard
          className="flex-1"
          title="전시후기"
          description={<MultilineText text={'전시를 체험한\n이야기와 감상을 나눠요'} />}
          image={loungeReviewThumbnail}
        />

        <div className="flex-1 flex flex-col gap-2.5">
          {TIP_CARDS.map(({ title, description }) => (
            <LoungeCard
              key={title}
              title={title}
              description={<MultilineText text={description} />}
            />
          ))}
        </div>
      </div>

      <LoungeCard className="flex items-start justify-between">
        <div className="flex items-end gap-4">
          <div className="w-[221px] h-12 flex flex-col justify-end gap-1">
            <h3 className="typo-body-xl-semibold text-main">전시 장소 대여</h3>
            <p className="typo-body-xs-regular text-sub600">전시 장소에 대한 정보를 공유해요</p>
          </div>
          <img alt="" className="w-24 h-20 object-cover shrink-0" src={loungeVenueThumbnail} />
        </div>
        <ArrowUpRight className="size-5 text-faint shrink-0" strokeWidth={1.5} />
      </LoungeCard>
    </div>
  );
}
