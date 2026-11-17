import { Link } from 'react-router-dom';

import { AgreementCheckIcon } from './AgreementCheckIcon';
import { focusOnMount } from './focusOnMount';
import type { TermKey, TermState } from './onboarding.types';
import { OnboardingBottomButton } from './OnboardingBottomButton';
import { OnboardingHeader } from './OnboardingHeader';
import { ChevronRightIcon } from './OnboardingIcons';

const TERMS_DOC_PATH = '/policy';

const TERM_ROWS: { key: TermKey; label: string; doc?: string }[] = [
  { key: 'service', label: '서비스 이용약관', doc: 'service' },
  { key: 'over14', label: '만 14세 이상 확인' },
];

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

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
  const canProceed = TERM_ROWS.every(({ key }) => terms[key]);

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
          이용약관 동의가 필요해요
        </h1>

        <div className="mt-10">
          <ul>
            {TERM_ROWS.map(({ key, label, doc }) => (
              <li key={key} className="flex min-h-13 items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={terms[key]}
                  onClick={() => onChange({ ...terms, [key]: !terms[key] })}
                  className={`group flex min-h-13 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-6 text-left ${FOCUS_RING}`}
                >
                  <AgreementCheckIcon checked={terms[key]} />
                  <span className="typography-body-lg-regular min-w-0 text-primary">
                    {label}
                    <span className="ml-1 text-tertiary">(필수)</span>
                  </span>
                </button>

                {doc ? (
                  <Link
                    to={`${TERMS_DOC_PATH}?doc=${doc}`}
                    aria-label={`${label} 보기`}
                    className={`-mr-2.5 grid size-11 shrink-0 place-items-center rounded-6 text-tertiary ${FOCUS_RING}`}
                  >
                    <ChevronRightIcon className="size-6" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>

          {/* 개인정보 수집·이용은 동의가 아니라 안내라서 체크 없이 글자 링크로 둔다(프로토타입) */}
          <Link
            to={`${TERMS_DOC_PATH}?doc=privacy-notice`}
            className={`typography-body-md-medium mt-1 inline-flex min-h-11 items-center rounded-6 text-secondary underline underline-offset-3 ${FOCUS_RING}`}
          >
            개인정보 수집·이용 안내
          </Link>
        </div>
      </main>

      <OnboardingBottomButton disabled={!canProceed} onClick={onNext}>
        다음
      </OnboardingBottomButton>
    </>
  );
}
