import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const ITEMS = [
  { label: '서비스 이용약관', href: '#' },
  { label: '개인정보 처리방침', href: '#' },
];

export function PolicyPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col bg-page">
      {/* Header */}
      <header className="mt-14.5 flex items-center gap-3 px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
          >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <div className="typo-body-xl-bold text-main">약관 및 개인정보</div>
      </header>

      <main className="px-5 pt-2">
        <div className="overflow-hidden rounded-2xl bg-card">
          {ITEMS.map((item, i) => (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center justify-between p-4 text-left ${
                i !== ITEMS.length - 1 ? 'border-b border-line' : ''
              }`}
            >
              <span className="typo-body-sm-semibold text-main">{item.label}</span>
              <ChevronRight className="size-5 text-faint" strokeWidth={1.67} />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
