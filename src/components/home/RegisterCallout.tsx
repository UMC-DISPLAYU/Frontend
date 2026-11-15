import GoIcon from '@/assets/home/GoIcon.svg';

import { HOME_INNER } from './homeLayout';

export function RegisterCallout({ onRegister }: { onRegister: () => void }) {
  return (
    <section aria-label="전시 등록 안내" className={HOME_INNER}>
      <div className="flex items-end justify-between gap-4 py-5">
        <div>
          <h2 className="typography-body-xxl-semibold text-primary">준비 중인 전시가 있나요?</h2>
          <p className="typography-body-md-medium text-tertiary">
            디유에 전시와 작품을 소개해보세요
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="typography-body-md-semibold relative flex shrink-0 cursor-pointer items-start rounded-4 whitespace-nowrap after:absolute after:inset-x-0 after:-inset-y-3.5 text-secondary underline decoration-from-font [text-underline-position:from-font] transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-focus"
        >
          전시 등록하기
          {/* 피그마: 12px 칸 안에 화살표(8.36×8.71)를 원래 크기로 둔다 */}
          <span className="relative mt-[3px] size-3 shrink-0">
            <img src={GoIcon} alt="" className="absolute top-[1.5px] left-[2.14px] max-w-none" />
          </span>
        </button>
      </div>
    </section>
  );
}
