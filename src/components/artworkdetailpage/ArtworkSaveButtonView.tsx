import { Bookmark } from 'lucide-react';

import { cn } from '@/utils/cn';

type Props = {
  saved: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export function ArtworkSaveButtonView({ saved, onClick, disabled = false, className }: Props) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? '작품 저장 취소' : '작품 저장'}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? '공개 전에는 사용할 수 없어요' : undefined}
      className={cn(
        'typography-body-lg-semibold flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-12 transition duration-fast ease-standard active:scale-98 disabled:cursor-not-allowed disabled:opacity-45',
        saved
          ? 'bg-tertiary text-primary'
          : 'bg-interactive-primary text-bg-primary-white hover:bg-interactive-primary-hover',
        className,
      )}
    >
      <Bookmark
        aria-hidden="true"
        size={16}
        strokeWidth={1.7}
        fill={saved ? 'currentColor' : 'none'}
      />
      {saved ? '저장됨' : '작품 저장'}
    </button>
  );
}
