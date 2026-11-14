import {
  ARTIST_PROFILE_FIELD_LABELS,
  ARTIST_PROFILE_FIELDS,
  type ArtistProfileField,
} from '@/constants/artistField';
import { MAX_ARTIST_FIELDS } from '@/constants/exhibition';
import { cn } from '@/utils/cn';

import { CheckIcon } from './ArtistVerifyIcons';
import { FOCUS_RING, PRESS_TRANSITION, TAP_BASE } from './artistVerifyStyles';
import { PROFILE_FIELD_CLASS } from './ProfileEditFields';
import { VerifyLabel } from './VerifyField';

const NUDGE_CLASS = 'artist-verify-nudge';

type ActivityFieldSelectorProps = {
  selected: ArtistProfileField[];
  onChange: (fields: ArtistProfileField[]) => void;
  onMaxSelectExceeded: () => void;
};

/* 최대 개수를 넘겨 누른 칸을 좌우로 한 번 흔든다. 같은 칸을 연달아 눌러도 다시 시작되게 클래스를 뺐다 넣는다 */
const nudge = (button: HTMLButtonElement) => {
  button.classList.remove(NUDGE_CLASS);
  void button.offsetWidth;
  button.classList.add(NUDGE_CLASS);
};

/** 작가 프로필 수정의 분야 칸. 모양은 프로토타입(profile-edit.html) .chip 과 같다 */
export function ActivityFieldSelector({
  selected,
  onChange,
  onMaxSelectExceeded,
}: ActivityFieldSelectorProps) {
  const toggle = (field: ArtistProfileField, button: HTMLButtonElement) => {
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
    <section className={PROFILE_FIELD_CLASS}>
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
        {ARTIST_PROFILE_FIELDS.map((field) => {
          const isSelected = selected.includes(field);
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
              key={field}
              onAnimationEnd={(event) => event.currentTarget.classList.remove(NUDGE_CLASS)}
              onClick={(event) => toggle(field, event.currentTarget)}
              type="button"
            >
              {isSelected ? <CheckIcon className="size-4 shrink-0" strokeWidth={2.2} /> : null}
              {ARTIST_PROFILE_FIELD_LABELS[field]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
