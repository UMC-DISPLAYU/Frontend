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
          {/* 전시 상세 링크(인스타 · 웹사이트)의 ↗와 같은 모양 */}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-[3px] size-3 shrink-0"
          >
            <path d="M4.125 7.875 7.875 4.125M7.875 4.125h-3M7.875 4.125v3" />
          </svg>
        </button>
      </div>
    </section>
  );
}
