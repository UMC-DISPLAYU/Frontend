import { useState } from 'react';

import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/components/common';

type TabKey = 'pending' | 'done';

interface Question {
  id: string;
  exhibition: string;
  desc: string;
  user: string;
  time: string;
  status: string;
  isOpen: boolean;
}

const PENDING: Question[] = [
  {
    id: 'p1',
    exhibition: '빛의 결',
    desc: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    user: 'artseeker_j',
    time: '1시간 전',
    status: '답변예정',
    isOpen: false,
  },
  {
    id: 'p2',
    exhibition: '빛의 결',
    desc: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    user: 'artseeker_j',
    time: '1시간 전',
    status: '답변예정',
    isOpen: true,
  },
];

const DONE: Question[] = [
  {
    id: 'd1',
    exhibition: '빛의 결',
    desc: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    user: 'artseeker_j',
    time: '1시간 전',
    status: '답변예정',
    isOpen: false,
  },
  {
    id: 'd2',
    exhibition: '빛의 결',
    desc: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    user: 'artseeker_j',
    time: '1시간 전',
    status: '답변예정',
    isOpen: true,
  },
];

interface QuestionCardProps {
  item: Question;
}

function QuestionCard({ item }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="typo-body-sm-semibold text-link">{item.exhibition}</span>
            <p className="typo-body-sm-regular text-main">{item.desc}</p>
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-4 flex-1 items-center gap-2">
              <span className="typo-body-xs-regular text-faint">{item.status}</span>
              <span className="typo-body-xs-regular text-faint">·</span>
              <span className="typo-body-xs-regular text-faint">{item.user}</span>
              <span className="typo-body-xs-regular text-faint">·</span>
              <span className="typo-body-xs-regular text-faint">{item.time}</span>
            </div>
            <div className="flex h-4 items-center gap-1">
              <div className="size-3 overflow-hidden">
                {item.isOpen ? (
                  <Eye className="size-3" strokeWidth={1.7} />
                ) : (
                  <EyeOff className="size-3" strokeWidth={1.7} />
                )}
              </div>
              <span className="typo-body-xs-regular text-faint">
                {item.isOpen ? '공개' : '비공개'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TabsProps {
  value: TabKey;
  onChange: (tab: TabKey) => void;
}

function Tabs({ value, onChange }: TabsProps) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: '미답변' },
    { key: 'done', label: '답변완료' },
  ];

  return (
    <div role="tablist" className="flex border-b border-line px-5">
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`-mb-[2px] flex h-11 flex-1 items-center justify-center border-b-2 transition-colors ${
              active
                ? 'border-main typo-body-sm-bold text-main'
                : 'border-transparent typo-body-sm-regular text-faint'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function AnswerPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('done');

  const items = tab === 'pending' ? PENDING : DONE;

  const handleDone = () => {
    navigate(-1);
  };

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">답변할 질문</h1>
      </header>

      <div>
        <Tabs value={tab} onChange={setTab} />
      </div>

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col">
        {items.length === 0 ? (
          <ErrorView fullScreen={false} message="답변할 질문 항목이 없어요." />
        ) : (
          <div className="flex flex-col gap-[10px]">
            {items.map((item) => (
              <QuestionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <div className="bg-gradient-to-b from-transparent via-page/75 to-page px-5 pb-2 pt-3">
        <button
          type="button"
          onClick={handleDone}
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gray-200 py-3 typo-body-sm-bold text-main"
        >
          완료
        </button>
      </div>
    </div>
  );
}
