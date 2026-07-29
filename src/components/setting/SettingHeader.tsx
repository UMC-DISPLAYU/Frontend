import { ChevronLeft } from 'lucide-react';

interface SettingHeaderProps {
  onBack: () => void;
}

export function SettingHeader({ onBack }: SettingHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-5 pt-4 pb-6">
      <button type="button" onClick={onBack} aria-label="뒤로가기" className="-ml-1">
        <ChevronLeft className="size-7 text-main" strokeWidth={2} />
      </button>
      <h1 className="typo-body-xl-bold text-main">설정</h1>
    </header>
  );
}
