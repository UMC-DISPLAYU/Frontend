import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  centered?: boolean;
}

export function PageHeader({ title, onBack, centered = false }: PageHeaderProps) {
  if (centered) {
    return (
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-14.5 pb-3">
        <button type="button" onClick={onBack} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <div className="typo-body-xl-bold text-center text-main">{title}</div>
        <div className="size-7" />
      </header>
    );
  }

  return (
    <header className="flex items-center gap-3 px-5 pt-14.5 pb-3">
      {onBack && (
        <button type="button" onClick={onBack} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
      )}
      <h1 className="typo-body-xl-bold text-main">{title}</h1>
    </header>
  );
}
