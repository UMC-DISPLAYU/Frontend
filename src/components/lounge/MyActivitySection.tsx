import { ArrowUpRight } from 'lucide-react';

import { LoungeCard } from './LoungeCard';

const ACTIVITY_CARDS = ['작성한 글', '내 댓글', '스크랩'];

export function MyActivitySection() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-3xl-bold text-neutral-900">내 활동</h2>
      <div className="flex gap-3">
        {ACTIVITY_CARDS.map((title) => (
          <LoungeCard
            key={title}
            className="flex-1 aspect-square flex flex-col justify-between items-end"
          >
            <ArrowUpRight className="size-5 text-neutral-400" strokeWidth={1.5} />
            <h3 className="w-full typo-body-3xl-semibold text-neutral-900 text-left">{title}</h3>
          </LoungeCard>
        ))}
      </div>
    </section>
  );
}
