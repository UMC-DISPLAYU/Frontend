import { MAX_ARTIST_FIELDS } from '@/constants/exhibition';
import { cn } from '@/utils/cn';

import { ACTIVITY_FIELDS, type ActivityFieldCode } from './activityFields';
import { CheckIcon } from './ArtistVerifyIcons';
import { FOCUS_RING, PRESS_TRANSITION, TAP_BASE } from './artistVerifyStyles';
import { VerifyLabel } from './VerifyField';

const NUDGE_CLASS = 'artist-verify-nudge';

type VerifyFieldChipsProps = {
  selected: ActivityFieldCode[];
  onChange: (fields: ActivityFieldCode[]) => void;
  onMaxSelectExceeded: () => void;
};

/* 최대 개수를 넘겨 누른 카드를 좌우로 한 번 흔든다. 같은 카드를 연달아 눌러도 다시 시작되게 클래스를 뺐다 넣는다. */
const nudge = (button: HTMLButtonElement) => {
  button.classList.remove(NUDGE_CLASS);
  void button.offsetWidth;
  button.classList.add(NUDGE_CLASS);
};

export function VerifyFieldChips({
  selected,
  onChange,
  onMaxSelectExceeded,
}: VerifyFieldChipsProps) {
  const toggle = (field: ActivityFieldCode, button: HTMLButtonElement) => {
    if (selected.includes(field)) {
      onChange(selected.filter((item) => item !== field));
      return;
    }
    if (selected.length >= MAX_ARTIST_FIELDS) {
      onMaxSelectExceeded();
      nudge(button);
      return;
    }
    onChange([...selected, field]);
  };

  return (
    <section className="mt-6 animate-[artist-verify-rise_.45s_cubic-bezier(.16,1,.3,1)_backwards]">
      <div className="flex items-center justify-between">
        <VerifyLabel id="activity-field-label">작가 분야</VerifyLabel>
        <span aria-live="polite" className="text-[12px] font-medium text-[#3f3f47] tabular-nums">
          {`${selected.length} / ${MAX_ARTIST_FIELDS}`}
        </span>
      </div>
      <div
        aria-labelledby="activity-field-label"
        className="mt-2.5 grid grid-cols-4 gap-1.5 tablet:grid-cols-6"
        role="group"
      >
        {ACTIVITY_FIELDS.map(({ code, label }) => {
          const isSelected = selected.includes(code);
          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                TAP_BASE,
                FOCUS_RING,
                PRESS_TRANSITION,
                'inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-[8px] border text-[14px] font-medium active:scale-[.97]',
                isSelected
                  ? 'border-[#18181b] bg-[#18181b] text-[#fff]'
                  : 'border-[#d4d4d8] hover:bg-[#f4f4f5]',
              )}
              key={code}
              onAnimationEnd={(event) => event.currentTarget.classList.remove(NUDGE_CLASS)}
              onClick={(event) => toggle(code, event.currentTarget)}
              type="button"
            >
              {isSelected ? <CheckIcon className="size-4 shrink-0" strokeWidth={2.2} /> : null}
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
