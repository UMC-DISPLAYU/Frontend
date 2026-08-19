import { memo, useCallback } from 'react';

import { Chip } from './Chip';

interface ChipGroupProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  labels?: Record<string, string>;
  maxSelect?: number;
  onMaxSelectExceeded?: () => void;
  breakAfterIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

export const ChipGroup = memo(function ChipGroup({
  options,
  selected,
  onChange,
  labels,
  maxSelect,
  onMaxSelectExceeded,
  breakAfterIndex,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  className = 'flex flex-wrap items-center gap-2',
}: ChipGroupProps) {
  const isSingleSelect = maxSelect === 1;

  const handleClick = useCallback(
    (option: string) => {
      if (isSingleSelect) {
        onChange([option]);
        return;
      }

      if (selected.includes(option)) {
        onChange(selected.filter((item) => item !== option));
        return;
      }

      if (maxSelect !== undefined && selected.length >= maxSelect) {
        onMaxSelectExceeded?.();
        return;
      }

      onChange([...selected, option]);
    },
    [isSingleSelect, maxSelect, onChange, onMaxSelectExceeded, selected],
  );

  const renderChip = (option: string) => (
    <Chip
      key={option}
      label={labels?.[option] ?? option}
      selected={selected.includes(option)}
      onClick={() => handleClick(option)}
      role={isSingleSelect ? 'radio' : 'checkbox'}
    />
  );

  if (breakAfterIndex !== undefined) {
    const firstRow = options.slice(0, breakAfterIndex + 1);
    const secondRow = options.slice(breakAfterIndex + 1);

    return (
      <div
        role={isSingleSelect ? 'radiogroup' : 'group'}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className="flex flex-col gap-2"
      >
        <div className={className}>{firstRow.map(renderChip)}</div>
        <div className={className}>{secondRow.map(renderChip)}</div>
      </div>
    );
  }

  return (
    <div
      role={isSingleSelect ? 'radiogroup' : 'group'}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
    >
      {options.map(renderChip)}
    </div>
  );
});
