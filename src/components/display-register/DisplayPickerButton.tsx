import { useId } from 'react';

import { cn } from '@/utils/cn';

import { FOCUS_CLASS } from './displayRegister.styles';
import { SearchIcon, UpDownIcon } from './DisplayRegisterIcons';

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

/** 프로토타입 .ul.pick — 높이 49, 값 16 / 400, 오른쪽 아이콘 20 */
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
  const Icon = icon === 'search' ? SearchIcon : UpDownIcon;

  return (
    <button
      id={id}
      type="button"
      aria-haspopup={haspopup}
      disabled={disabled}
      aria-labelledby={`${labelId} ${valueId}`}
      onClick={onClick}
      className={cn(
        'mt-1 flex h-[49px] w-full min-w-0 items-center justify-between gap-2 border-b border-primary text-left transition-colors duration-fast ease-standard focus-within:border-[#18181b] disabled:cursor-default',
        FOCUS_CLASS,
      )}
    >
      <span
        id={valueId}
        className={cn(
          'typography-body-xl-regular min-w-0 truncate',
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
      <Icon className={cn('size-5 shrink-0 text-primary', disabled && 'opacity-40')} />
    </button>
  );
}
