import CheckIcon from '@/assets/display-register/CheckIcon.svg';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import { DISPLAY_FIELD_OPTIONS, MAX_DISPLAY_FIELDS } from './displayRegister.constants';

interface DisplayFieldChipsProps {
  labelId: string;
  selected: string[];
  onChange: (next: string[]) => void;
}

export function DisplayFieldChips({ labelId, selected, onChange }: DisplayFieldChipsProps) {
  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((item) => item !== label));
      return;
    }

    if (selected.length >= MAX_DISPLAY_FIELDS) {
      toast(`분야는 최대 ${MAX_DISPLAY_FIELDS}개까지 선택할 수 있어요`);
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
      {DISPLAY_FIELD_OPTIONS.map(({ label }) => {
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
