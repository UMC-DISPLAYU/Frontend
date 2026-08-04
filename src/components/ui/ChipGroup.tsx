import { memo, useCallback } from 'react';

import { Chip } from './Chip';

interface ChipGroupProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /* 선택 가능한 최대 개수입니다. 생략하면 제한 없이 고를 수 있습니다. */
  maxSelect?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/*
 * 칩 목록과 선택 상태를 함께 다루는 공용 컴포넌트입니다.
 * maxSelect가 1이면 라디오처럼 동작해 고른 항목으로 바로 교체하고,
 * 그 외에는 체크박스처럼 토글하되 최대 개수를 넘으면 추가를 무시합니다.
 */
export const ChipGroup = memo(function ChipGroup({
  options,
  selected,
  onChange,
  maxSelect,
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

      if (maxSelect !== undefined && selected.length >= maxSelect) return;

      onChange([...selected, option]);
    },
    [isSingleSelect, maxSelect, onChange, selected],
  );

  return (
    <div
      role={isSingleSelect ? 'radiogroup' : 'group'}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
    >
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={selected.includes(option)}
          onClick={() => handleClick(option)}
          role={isSingleSelect ? 'radio' : 'checkbox'}
        />
      ))}
    </div>
  );
});
