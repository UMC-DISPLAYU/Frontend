type FilterChipProps = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

export function FilterChip({ label, onClick, selected }: FilterChipProps) {
  return (
    <button
      aria-pressed={selected}
      className={`flex shrink-0 items-center justify-center gap-2.5 rounded-sm border px-2.5 py-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
        selected
          ? 'text-xs font-bold tracking-tight text-neutral-900 border-neutral-900'
          : 'text-xs font-normal tracking-tight text-neutral-600 border-line'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
