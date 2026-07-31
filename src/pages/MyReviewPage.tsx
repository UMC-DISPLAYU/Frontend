import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReviewCardProps {
  title: string;
  body: string;
  status: string;
  author: string;
  time: string;
  answerState: string;
}

function ReviewCard({ title, body, status, author, time, answerState }: ReviewCardProps) {
  return (
    <div className="w-full rounded-lg bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex flex-col gap-1">
        <p className="typo-body-sm-semibold text-link">{title}</p>
        <p className="typo-body-sm-regular text-main line-clamp-2">{body}</p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 typo-body-xs-regular text-faint">
          <span>{status}</span>
          <span aria-hidden>·</span>
          <span>{author}</span>
          <span aria-hidden>·</span>
          <span>{time}</span>
        </div>
        <span className="typo-body-xs-regular text-faint shrink-0">{answerState}</span>
      </div>
    </div>
  );
}

const TABS = ['전시', '작품'];

interface Review {
  id: number;
  title: string;
  body: string;
  status: string;
  author: string;
  time: string;
  answerState: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    title: '빛의 결',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    status: '답변예정',
    author: 'artseeker_j',
    time: '1시간 전',
    answerState: '답변대기',
  },
  {
    id: 2,
    title: '빛의 결',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    status: '답변예정',
    author: 'artseeker_j',
    time: '1시간 전',
    answerState: '답변완료',
  },
];

export function MyReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('전시');

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">내가 남긴 감상</h1>
      </header>

      <nav className="flex border-b border-line" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={[
                'h-11 flex-1 border-b-2 transition-colors',
                isActive
                  ? 'border-bt-black typo-body-sm-bold text-main'
                  : 'border-transparent typo-body-sm-regular text-faint',
              ].join(' ')}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-4">
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>
      </section>
    </div>
  );
}
