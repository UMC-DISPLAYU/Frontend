import { useId } from 'react';

import SearchIcon from '@/assets/display-register/SearchIcon.svg';
import SelectorIcon from '@/assets/display-register/SelectorIcon.svg';
import { cn } from '@/utils/cn';

interface DisplayPickerButtonProps {
  id?: string;
  /** 그룹 라벨(전시 기간 등)의 id. 버튼 자체 이름과 함께 읽힌다 */
  labelId: string;
  placeholder: string;
  value: string;
  icon?: 'selector' | 'search';
  haspopup?: 'dialog';
  disabled?: boolean;
  onClick: () => void;
}

export function DisplayPickerButton({
  id,
  labelId,
  placeholder,
  value,
  icon = 'selector',
  haspopup,
  disabled = false,
  onClick,
}: DisplayPickerButtonProps) {
  const valueId = useId();

  return (
    <button
      id={id}
      type="button"
      aria-haspopup={haspopup}
      disabled={disabled}
      aria-labelledby={`${labelId} ${valueId}`}
      onClick={onClick}
      className="flex w-full min-w-0 items-center gap-2 border-b border-primary py-3 text-left transition duration-fast ease-standard enabled:hover:border-interactive-primary disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <span
        id={valueId}
        className={cn(
          'typography-body-xl-regular min-w-0 flex-1 truncate',
          value ? (disabled ? 'text-secondary' : 'text-primary') : 'text-tertiary',
        )}
      >
        {value ? (
          <>
            <span className="sr-only">{placeholder} </span>
            {value}
          </>
        ) : (
          placeholder
        )}
      </span>
      <img
        src={icon === 'search' ? SearchIcon : SelectorIcon}
        alt=""
        className={cn('size-6 shrink-0', disabled && 'opacity-40')}
      />
    </button>
  );
}
