import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TABS = ['전시', '작품'];

interface Question {
  title: string;
  body: string;
  state: string;
  author: string;
  time: string;
  status: string;
}

const QUESTIONS: Question[] = [
  {
    title: '빛의 결',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    state: '답변예정',
    author: 'artseeker_j',
    time: '1시간 전',
    status: '답변대기',
  },
  {
    title: '빛의 결',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    state: '답변예정',
    author: 'artseeker_j',
    time: '1시간 전',
    status: '답변완료',
  },
];

interface QuestionCardProps {
  q: Question;
}

function QuestionCard({ q }: QuestionCardProps) {
  return (
    <article className="w-full rounded-lg bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="typo-body-sm-semibold text-link">{q.title}</h3>
          <p className="line-clamp-2 typo-body-sm-regular text-main">{q.body}</p>
        </div>

        <div className="flex items-center gap-2 typo-body-xs-regular text-faint">
          <div className="flex flex-1 items-center gap-2">
            <span>{q.state}</span>
            <span aria-hidden>·</span>
            <span>{q.author}</span>
            <span aria-hidden>·</span>
            <span>{q.time}</span>
          </div>
          <span>{q.status}</span>
        </div>
      </div>
    </article>
  );
}

export function MyQuestionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">내가 한 질문</h1>
      </header>

      <div role="tablist" className="flex border-b border-line px-5">
        {TABS.map((tab, i) => {
          const active = i === activeTab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex h-11 flex-1 items-center justify-center border-b-2 ${
                active
                  ? 'border-main typo-body-sm-bold text-main'
                  : 'border-transparent typo-body-sm-regular text-faint'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-3.5">
          {QUESTIONS.map((q, i) => (
            <QuestionCard key={i} q={q} />
          ))}
        </div>
      </section>
    </div>
  );
}
