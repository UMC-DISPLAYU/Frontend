import { ArrowUpRight } from 'lucide-react';

import { LoungeCard } from './LoungeCard';

const QNA_CARDS = [
  { description: '나에게 들어온 질문을 확인하세요', title: '받은 질문' },
  { description: '내가 보낸 질문을 확인하세요', title: '보낸 질문' },
];

export function QnaSection() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-3xl-bold text-neutral-900">Q&amp;A</h2>
      <div className="flex gap-2.5">
        {QNA_CARDS.map(({ description, title }) => (
          <LoungeCard key={title} className="flex-1 h-36 flex flex-col justify-between items-end">
            <ArrowUpRight className="size-5 text-neutral-400" strokeWidth={1.5} />
            <div className="w-full flex flex-col items-start gap-1">
              <h3 className="typo-body-3xl-semibold text-neutral-900">{title}</h3>
              <p className="typo-body-xs-regular text-neutral-600">{description}</p>
            </div>
          </LoungeCard>
        ))}
      </div>
    </section>
  );
}
