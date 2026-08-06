import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ErrorView } from '@/components/common';

const TABS = ['전시', '작품'];

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
        <ErrorView fullScreen={false} message="남긴 감상 항목이 없어요." />
      </section>
    </div>
  );
}
