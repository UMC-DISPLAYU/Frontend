type FilterChipProps = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

export function FilterChip({ label, onClick, selected }: FilterChipProps) {
  return (
    <button
      aria-pressed={selected}
      className={`flex shrink-0 items-center justify-center gap-2.5 rounded-sm px-2.5 py-1.5 whitespace-nowrap shadow-[4px_4px_12px_0px_rgba(67,0,209,0.05)] outline outline-1 -outline-offset-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
        selected
          ? 'text-xs font-bold tracking-tight text-neutral-900 outline-neutral-900'
          : 'text-xs font-normal tracking-tight text-neutral-600 outline-stone-300'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
