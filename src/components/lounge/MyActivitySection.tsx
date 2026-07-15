import { ArrowUpRight } from 'lucide-react';

import { LoungeCard } from './LoungeCard';

const ACTIVITY_CARDS = ['작성한 글', '내 댓글', '스크랩'];

export function MyActivitySection() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-xl-bold text-main">내 활동</h2>
      <div className="flex gap-3">
        {ACTIVITY_CARDS.map((title) => (
          <LoungeCard
            key={title}
            className="flex-1 aspect-square flex flex-col justify-between items-end"
          >
            <ArrowUpRight className="size-5 text-faint" strokeWidth={1.5} />
            <h3 className="w-full typo-body-xl-semibold text-main text-left">{title}</h3>
          </LoungeCard>
        ))}
      </div>
    </section>
  );
}
