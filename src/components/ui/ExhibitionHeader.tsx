import { ChevronLeft } from 'lucide-react';

import { useFlowBack } from '@/hooks/useFlowBack';

interface ExhibitionHeaderProps {
  title: string;
  onBack?: () => void;
  centered?: boolean;
}

export function ExhibitionHeader({ title, onBack, centered = false }: ExhibitionHeaderProps) {
  const flowBack = useFlowBack();
  const handleBack = onBack || flowBack;

  if (centered) {
    return (
      <div className="px-5 py-6 shrink-0">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 my-0.75">
          <button
            type="button"
            onClick={handleBack}
            className="cursor-pointer -ml-1"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="text-main" />
          </button>
          <div className="text-dark typo-body-xl-bold text-center">{title}</div>
          <div className="w-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 shrink-0">
      <div className="flex items-center gap-3 my-0.75">
        <button
          type="button"
          onClick={handleBack}
          className="cursor-pointer -ml-1"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="text-main" />
        </button>
        <div className="text-dark typo-body-xl-bold">{title}</div>
      </div>
    </div>
  );
}
