import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/components/common';

const TABS = ['전시', '작품'];

export function MyQuestionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="w-96 mx-auto h-dvh bg-page flex flex-col">
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

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col">
        <ErrorView fullScreen={false} message="등록된 질문이 없습니다." />
      </section>
    </div>
  );
}
