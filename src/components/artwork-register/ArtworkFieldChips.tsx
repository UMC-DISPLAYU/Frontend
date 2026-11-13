import CheckIcon from '@/assets/display-register/CheckIcon.svg';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import {
  ARTWORK_FIELD_OPTIONS,
  exceedsArtworkFieldLimit,
  MAX_ARTWORK_FIELDS,
} from './artworkRegister.constants';

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
    <div
      role="group"
      aria-labelledby={labelId}
      className="grid grid-cols-4 gap-1.5 tablet:grid-cols-6"
    >
      {ARTWORK_FIELD_OPTIONS.map(({ label }) => {
        const isSelected = selected.includes(label);

        return (
          <button
            key={label}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(label)}
            className={cn(
              'typography-body-lg-medium flex h-11 min-w-0 items-center justify-center gap-1 rounded-8 border transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99',
              isSelected
                ? 'border-interactive-primary bg-interactive-primary text-interactive-inverse'
                : 'border-primary bg-primary-white text-primary hover:bg-secondary',
            )}
          >
            {isSelected && <img src={CheckIcon} alt="" className="size-4 shrink-0" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
