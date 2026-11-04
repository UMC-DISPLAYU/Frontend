import { FilterChip } from './FilterChip';

type CategoryFilterBarProps = {
  options: readonly string[];
  selected: string | null;
  onSelect: (option: string) => void;
};

export function CategoryFilterBar({ options, selected, onSelect }: CategoryFilterBarProps) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto">
      {options.map((option) => (
        <FilterChip
          key={option}
          label={option}
          onClick={() => onSelect(option)}
          selected={option === selected}
        />
      ))}
    </div>
  );
}
