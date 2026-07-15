import { ArrowUpRight } from 'lucide-react';

import loungeVenueThumbnail from '@/assets/LoungeVenueThumbnail.svg';

import { LoungeCard } from './LoungeCard';

const ACTIVITY_CARDS = [
  { image: loungeVenueThumbnail, title: '작성한 글' },
  { title: '내 댓글' },
  { title: '스크랩' },
];

export function MyActivitySection() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-xl-bold text-main">내 활동</h2>
      <div className="flex gap-2.5">
        {ACTIVITY_CARDS.map(({ image, title }) =>
          image ? (
            <LoungeCard
              key={title}
              className="w-28 h-32 flex flex-col items-center justify-between"
            >
              <ArrowUpRight className="size-5 text-faint self-end" strokeWidth={1.5} />
              <img alt="" className="w-16 h-14 object-cover" src={image} />
              <h3 className="w-full typo-body-xl-semibold text-main text-left">{title}</h3>
            </LoungeCard>
          ) : (
            <LoungeCard key={title} className="w-28 h-32 flex flex-col justify-between items-end">
              <ArrowUpRight className="size-5 text-faint" strokeWidth={1.5} />
              <h3 className="w-full typo-body-xl-semibold text-main text-left">{title}</h3>
            </LoungeCard>
          ),
        )}
      </div>
    </section>
  );
}
