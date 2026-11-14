import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import { DISPLAY_FIELD_OPTIONS, MAX_DISPLAY_FIELDS } from './displayRegister.constants';
import { FOCUS_CLASS } from './displayRegister.styles';
import { CheckIcon } from './DisplayRegisterIcons';

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
      className="mt-2.5 grid grid-cols-4 gap-1.5 tablet:grid-cols-6"
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
