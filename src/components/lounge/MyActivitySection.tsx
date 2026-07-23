import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import loungeVenueThumbnail from '@/assets/LoungeVenueThumbnail.svg';

import { LoungeCard } from './LoungeCard';

const ACTIVITY_CARDS: { image?: string; title: string; tab: string }[] = [
  { image: loungeVenueThumbnail, title: '작성한 글', tab: 'written' },
  { title: '내 댓글', tab: 'comments' },
  { title: '스크랩', tab: 'scraps' },
];

export function MyActivitySection() {
  const navigate = useNavigate();
  const goToTab = (tab: string) => navigate('/lounge/my-activity', { state: { tab } });

  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-xl-bold text-main">내 활동</h2>
      <div className="flex gap-2.5">
        {ACTIVITY_CARDS.map(({ image, title, tab }) =>
          image ? (
            <LoungeCard
              key={title}
              className="flex-1 h-32 flex flex-col items-center justify-between"
              onClick={() => goToTab(tab)}
            >
              <ArrowUpRight className="size-5 text-faint self-end" strokeWidth={1.5} />
              <img alt="" className="w-16 h-14 object-cover" src={image} />
              <h3 className="w-full typo-body-xl-semibold text-main text-left">{title}</h3>
            </LoungeCard>
          ) : (
            <LoungeCard
              key={title}
              className="flex-1 h-32 flex flex-col justify-between items-end"
              onClick={() => goToTab(tab)}
            >
              <ArrowUpRight className="size-5 text-faint" strokeWidth={1.5} />
              <h3 className="w-full typo-body-xl-semibold text-main text-left">{title}</h3>
            </LoungeCard>
          ),
        )}
      </div>
    </section>
  );
}
