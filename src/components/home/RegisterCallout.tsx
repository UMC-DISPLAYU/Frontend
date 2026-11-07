import GoIcon from '@/assets/home/GoIcon.svg';

import { HOME_INNER } from './homeLayout';

export function RegisterCallout({ onRegister }: { onRegister: () => void }) {
  return (
    <section aria-label="전시 등록 안내" className={HOME_INNER}>
      <div className="flex items-end justify-between gap-4 py-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="typography-body-xxl-semibold text-primary">준비 중인 전시가 있나요?</h2>
          <p className="typography-body-md-medium text-tertiary">
            디유에 전시와 작품을 소개해보세요
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="typography-body-md-semibold -my-3 flex min-h-11 shrink-0 items-center gap-0.75 rounded-4 whitespace-nowrap text-secondary underline underline-offset-2 transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-focus"
        >
          전시 등록하기
          <span className="grid size-3 place-items-center">
            <img src={GoIcon} alt="" />
          </span>
        </button>
      </div>
    </section>
  );
}
