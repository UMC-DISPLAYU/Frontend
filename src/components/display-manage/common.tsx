import { ChevronLeft } from 'lucide-react';

export function Screen({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col h-full bg-page">{children}</div>;
}

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-3.5 pb-2.5">
      {onBack && (
        <button
          onClick={onBack}
          className="bg-transparent border-none cursor-pointer p-0 flex"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={26} className="text-main" strokeWidth={2.4} />
        </button>
      )}
      <span className="typo-body-xl-bold text-main">{title}</span>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="typo-body-sm-bold text-main">{children}</div>;
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+6px)]"
      style={{ background: 'linear-gradient(180deg, rgba(240,240,243,0) 0%, var(--color-page) 40%)' }}
    >
      {children}
    </div>
  );
}
