type FilterChipProps = {
  label: string;
  onClick: () => void;
  selected: boolean;
};

export function FilterChip({ label, onClick, selected }: FilterChipProps) {
  return (
    <button
      className={`h-8 shrink-0 rounded-[10px] px-3 text-xs font-medium whitespace-nowrap outline outline-1 -outline-offset-1 ${
        selected
          ? 'bg-neutral-900 text-white outline-neutral-900'
          : 'bg-white text-gray-700 outline-gray-200'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
