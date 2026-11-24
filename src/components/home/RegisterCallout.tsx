import ChevronMoreIcon from '@/assets/home/ChevronMoreIcon.svg';

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
          className="typography-body-md-semibold group relative flex shrink-0 cursor-pointer items-center gap-0.5 rounded-4 whitespace-nowrap text-secondary after:absolute after:-inset-x-1 after:-inset-y-3 focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span className="decoration-1 underline-offset-3 group-hover:underline">
            전시 등록하기
          </span>
          {/* 안쪽 화면으로 이동하므로 더보기와 같은 꺾쇠를 쓴다 */}
          <img
            src={ChevronMoreIcon}
            alt=""
            className="size-4 shrink-0 transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </section>
  );
}
