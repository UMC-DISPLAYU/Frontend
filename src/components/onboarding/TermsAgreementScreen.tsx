import { AgreementCheckIcon } from './AgreementCheckIcon';
import { focusOnMount } from './focusOnMount';
import type { TermKey, TermState } from './onboarding.types';
import { OnboardingBottomButton } from './OnboardingBottomButton';
import { OnboardingHeader } from './OnboardingHeader';
import { ChevronRightIcon } from './OnboardingIcons';

const TERM_ROWS: { key: TermKey; label: string; required: boolean }[] = [
  { key: 'service', label: '서비스 이용약관', required: true },
  { key: 'privacy', label: '개인정보 수집·이용 동의', required: true },
  { key: 'over14', label: '만 14세 이상 확인', required: true },
  { key: 'location', label: '위치기반서비스 이용약관', required: false },
];

const hasDocument = (key: TermKey) => key !== 'over14';

const CHECK_BUTTON_CLASS =
  'group flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

export function TermsAgreementScreen({
  terms,
  onBack,
  onChange,
  onNext,
}: {
  terms: TermState;
  onBack: () => void;
  onChange: (terms: TermState) => void;
  onNext: () => void;
}) {
  const allChecked = Object.values(terms).every(Boolean);
  const canProceed = TERM_ROWS.every(({ key, required }) => !required || terms[key]);

  const toggleAll = () => {
    const next = !allChecked;
    onChange({ over14: next, service: next, privacy: next, location: next });
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} />

      <main className="flex-1">
        <h1
          ref={focusOnMount}
          tabIndex={-1}
          className="typography-title-xs mt-2 text-primary outline-none"
        >
          서비스 이용을 위해
          <br />
          이용약관 동의가 필요합니다
        </h1>

        <div className="mt-10">
          <div className="flex min-h-14 items-center">
            <button
              type="button"
              role="checkbox"
              aria-checked={allChecked}
              onClick={toggleAll}
              className={`${CHECK_BUTTON_CLASS} min-h-14`}
            >
              <AgreementCheckIcon checked={allChecked} />
              <span className="typography-body-xl-semibold text-primary">전체 동의</span>
            </button>
          </div>

          <hr className="border-primary" />

          <ul>
            {TERM_ROWS.map(({ key, label, required }) => (
              <li key={key} className="flex min-h-13 items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={terms[key]}
                  onClick={() => onChange({ ...terms, [key]: !terms[key] })}
                  className={`${CHECK_BUTTON_CLASS} min-h-13`}
                >
                  <AgreementCheckIcon checked={terms[key]} />
                  <span className="typography-body-lg-regular min-w-0 text-primary">
                    {label}
                    <span className="ml-1 text-tertiary">{required ? '(필수)' : '(선택)'}</span>
                  </span>
                </button>

                {hasDocument(key) ? (
                  /* 약관 상세 화면은 두지 않고 프로토타입처럼 화살표 모양만 남긴다 */
                  <span
                    aria-hidden="true"
                    className="-mr-2.5 grid size-11 shrink-0 place-items-center text-tertiary"
                  >
                    <ChevronRightIcon className="size-6" />
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <OnboardingBottomButton disabled={!canProceed} onClick={onNext}>
        다음
      </OnboardingBottomButton>
    </>
  );
}
