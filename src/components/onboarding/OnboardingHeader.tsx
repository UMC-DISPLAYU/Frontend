import { ChevronLeft } from 'lucide-react';

export function OnboardingHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="shrink-0 pt-3.5">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="-ml-1 flex size-9 items-center justify-center"
      >
        <ChevronLeft className="size-7 text-icon-interactive-primary" strokeWidth={1.75} />
      </button>
    </div>
  );
}
