import { cn } from '@/utils/cn';

type FilterChipProps = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

export function FilterChip({ label, onClick, selected }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center justify-center gap-2.5 rounded-sm border px-2.5 py-1.5 whitespace-nowrap cursor-pointer transition-colors',
        selected
          ? 'typo-body-xs-bold text-filter-text-on border-filter-border-on'
          : 'typo-body-xs-regular text-filter-text-off border-filter-border-off',
      )}
    >
      {label}
    </button>
  );
}
