import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import {
  ARTWORK_FIELD_OPTIONS,
  exceedsArtworkFieldLimit,
  MAX_ARTWORK_FIELDS,
} from './artworkRegister.constants';
import { FOCUS_CLASS } from './artworkRegister.styles';
import { CheckIcon } from './ArtworkRegisterIcons';

interface ArtworkFieldChipsProps {
  labelId: string;
  selected: string[];
  /** 수정할 때 기존 서버 분야. 기타가 화면에 없는 분야를 대신하면 한도를 그만큼 센다 */
  previousTypes?: readonly string[];
  onChange: (next: string[]) => void;
}

export function ArtworkFieldChips({
  labelId,
  selected,
  previousTypes,
  onChange,
}: ArtworkFieldChipsProps) {
  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((item) => item !== label));
      return;
    }

    if (exceedsArtworkFieldLimit([...selected, label], previousTypes)) {
      toast(`분야는 최대 ${MAX_ARTWORK_FIELDS}개까지 선택할 수 있어요`);
      return;
    }

    onChange([...selected, label]);
  };

  return (
    <div role="group" aria-labelledby={labelId} className="mt-2 grid grid-cols-4 gap-1.5">
      {ARTWORK_FIELD_OPTIONS.map(({ label }) => {
        const isSelected = selected.includes(label);

        return (
          <button
            key={label}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(label)}
            className={cn(
              'typography-body-lg-medium inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-8 border transition-[background-color,color,border-color,transform] duration-fast ease-standard active:scale-97',
              FOCUS_CLASS,
              isSelected
                ? 'border-[#18181b] bg-[#18181b] text-base-white'
                : 'border-primary text-primary hover:bg-secondary',
            )}
          >
            {isSelected && <CheckIcon strokeWidth={2.2} className="size-4" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
