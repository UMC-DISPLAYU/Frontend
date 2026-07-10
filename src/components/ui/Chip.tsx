import { memo } from 'react';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export const Chip = memo(function Chip({
  label,
  selected,
  onClick,
}: ChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-sm shadow-[4px_4px_12px_0px_rgba(67,0,209,0.05)] outline outline-1 outline-offset-[-1px] transition-colors text-xs leading-4 tracking-tight whitespace-nowrap ${
        selected
          ? 'outline-neutral-900 text-neutral-900 font-bold'
          : 'outline-stone-300 text-neutral-600 font-normal'
      }`}
    >
      {label}
    </button>
  );
});
