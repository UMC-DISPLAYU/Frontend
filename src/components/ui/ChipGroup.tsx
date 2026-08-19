import { memo, useCallback } from 'react';

import { Chip } from './Chip';

interface ChipGroupProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /* 값과 화면 표시가 다를 때 쓰는 라벨 매핑입니다. 없으면 값을 그대로 보여줍니다. */
  labels?: Record<string, string>;
  /* 선택 가능한 최대 개수입니다. 생략하면 제한 없이 고를 수 있습니다. */
  maxSelect?: number;
  onMaxSelectExceeded?: () => void;
  /* 이 인덱스 다음 칩부터 새 줄에서 시작하도록 강제로 줄바꿈합니다. 특정 칩들을 항상 같은 줄에 묶고 싶을 때 씁니다. */
  breakAfterIndex?: number;
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

  /* breakAfterIndex가 있으면 두 줄로 나눠, 각 줄 안에서만 자연스럽게 wrap되게 합니다.
   * (하나의 flex-wrap 컨테이너에 빈 줄바꿈 스페이서를 넣으면 그 스페이서 앞뒤로 gap이
   * 두 번 들어가 줄 간격이 두 배가 됩니다.) */
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
