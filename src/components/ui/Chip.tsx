import { memo } from 'react';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  role?: 'radio' | 'checkbox';
}

export const Chip = memo(function Chip({ label, selected, onClick, role = 'radio' }: ChipProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-sm outline -outline-offset-1 transition-colors leading-4 tracking-tight whitespace-nowrap ${
        selected
          ? 'outline-main text-main typo-body-xs-bold'
          : 'outline-line text-sub600 typo-body-xs-regular'
      }`}
    >
      {label}
    </button>
  );
});
