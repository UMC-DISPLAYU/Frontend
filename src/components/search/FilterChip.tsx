type FilterChipProps = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

export function FilterChip({ label, onClick, selected }: FilterChipProps) {
  return (
    <button
      className={`flex shrink-0 items-center justify-center gap-2.5 rounded-sm px-2.5 py-1.5 whitespace-nowrap outline outline-1 -outline-offset-1 ${
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
