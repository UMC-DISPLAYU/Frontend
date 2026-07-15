import { ArrowUpRight } from 'lucide-react';

import { LoungeCard } from './LoungeCard';

const QNA_CARDS = [
  { description: '나에게 들어온 질문을 확인하세요', title: '받은 질문' },
  { description: '내가 보낸 질문을 확인하세요', title: '보낸 질문' },
];

export function QnaSection() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-xl-bold text-main">Q&amp;A</h2>
      <div className="flex justify-between">
        {QNA_CARDS.map(({ description, title }) => (
          <LoungeCard key={title} className="w-44 h-36 flex flex-col justify-between items-end">
            <ArrowUpRight className="size-5 text-faint" strokeWidth={1.5} />
            <div className="w-full flex flex-col items-start gap-1">
              <h3 className="typo-body-xl-semibold text-main">{title}</h3>
              <p className="typo-body-xs-regular text-sub600">{description}</p>
            </div>
          </LoungeCard>
        ))}
      </div>
    </section>
  );
}
