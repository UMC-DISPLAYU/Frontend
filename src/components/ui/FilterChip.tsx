import { cn } from '@/utils/cn';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        'shrink-0 cursor-pointer rounded-8 border px-3.25 py-2.25 whitespace-nowrap',
        selected
          ? 'typography-body-md-semibold border-interactive-selected bg-primary-black text-quaternary'
          : 'typography-body-md-medium border-icon-tertiary bg-primary-white text-tertiary',
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
