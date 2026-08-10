import { ChevronLeft } from 'lucide-react';

export function Screen({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-page">{children}</div>;
}

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-14.5 pb-3">
      {onBack && (
        <button
          onClick={onBack}
          className="-ml-1 flex bg-transparent border-none p-0 cursor-pointer"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
      )}
      <span className="typo-body-xl-bold text-main">{title}</span>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="typo-body-sm-bold text-main">{children}</div>;
}
