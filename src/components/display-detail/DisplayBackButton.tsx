import { ChevronLeft } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  onBack: () => void;
  className?: string;
};

/* 피그마 `Btn / back`: 44 · 검정 45% · 배경 흐림 · 흰 화살표 28(선 2) */
export function DisplayBackButton({ onBack, className }: Props) {
  return (
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={onBack}
      className={cn(
        'grid size-11 cursor-pointer place-items-center rounded-circle bg-base-black/45 text-icon-white backdrop-blur-sm transition-transform duration-fast ease-standard hover:-translate-x-0.5 focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-94',
        className,
      )}
    >
      <ChevronLeft aria-hidden="true" size={28} strokeWidth={2} />
    </button>
  );
}
