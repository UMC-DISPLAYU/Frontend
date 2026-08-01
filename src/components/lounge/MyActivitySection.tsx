import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import myCommentsIcon from '@/assets/my-comments.svg';
import savedPostsIcon from '@/assets/saved-posts.svg';
import scrapsIcon from '@/assets/scraps.svg';

import { LoungeCard } from './LoungeCard';

const ACTIVITY_CARDS: { image: string; imageClassName: string; title: string; tab: string }[] = [
  {
    image: savedPostsIcon,
    imageClassName: 'w-[47px] h-[37px]',
    title: '작성한 글',
    tab: 'written',
  },
  { image: myCommentsIcon, imageClassName: 'w-10 h-[38px]', title: '내 댓글', tab: 'comments' },
  { image: scrapsIcon, imageClassName: 'w-[42px] h-10', title: '스크랩', tab: 'scraps' },
];

export function MyActivitySection() {
  const navigate = useNavigate();
  const goToTab = (tab: string) => navigate('/lounge/my-activity', { state: { tab } });

  return (
    <section className="flex flex-col gap-3">
      <h2 className="typo-body-xl-bold text-main">내 활동</h2>
      <div className="grid grid-cols-3 gap-2.5">
        {ACTIVITY_CARDS.map(({ image, imageClassName, title, tab }) => (
          <LoungeCard key={title} className="relative h-[85px]" onClick={() => goToTab(tab)}>
            <ArrowUpRight className="absolute top-3 right-3 size-5 text-faint" strokeWidth={2.5} />
            <div className="w-full flex flex-col items-start gap-0.5 mt-0.5">
              <img alt="" className={`${imageClassName} object-contain`} src={image} />
              <h3 className="typo-body-md-semibold text-main">{title}</h3>
            </div>
          </LoungeCard>
        ))}
      </div>
    </section>
  );
}
