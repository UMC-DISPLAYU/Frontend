import type { ReactNode } from 'react';

import { AgreementCheckIcon } from './AgreementCheckIcon';
import type { PolicyTermKey, TermKey, TermState } from './onboarding.types';
import { OnboardingBottomButton } from './OnboardingBottomButton';
import { OnboardingHeader } from './OnboardingHeader';

function TermLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[16px] leading-[1.4] font-medium tracking-[-0.03em] text-sub600 underline underline-offset-2"
    >
      {children}
    </button>
  );
}

function TermTag({ required }: { required: boolean }) {
  return (
    <span className="ml-1.5 text-[14px] leading-[1.4] font-normal tracking-[-0.03em] text-[#9ca3af]">
      {required ? '(필수)' : '(선택)'}
    </span>
  );
}

function TermRow({
  checked,
  label,
  onToggle,
  children,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-0.5">
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`${label} 동의`}
        onClick={onToggle}
        className="shrink-0"
      >
        <AgreementCheckIcon checked={checked} />
      </button>
    </div>
  );
}

export function TermsAgreementScreen({
  terms,
  onBack,
  onChange,
  onNext,
  onOpenDetail,
}: {
  terms: TermState;
  onBack: () => void;
  onChange: (terms: TermState) => void;
  onNext: () => void;
  onOpenDetail: (key: PolicyTermKey) => void;
}) {
  const allChecked = Object.values(terms).every(Boolean);
  const termsAndPrivacyChecked = terms.service && terms.privacy;
  const canProceed = terms.over14 && terms.service && terms.privacy;

  const toggleAll = () => {
    const next = !allChecked;
    onChange({ over14: next, service: next, privacy: next, location: next });
  };

  const toggle = (key: TermKey) => onChange({ ...terms, [key]: !terms[key] });

  /* 이용약관과 개인정보취급방침은 화면에서 한 줄로 묶여 함께 동의한다 */
  const toggleTermsAndPrivacy = () => {
    const next = !termsAndPrivacyChecked;
    onChange({ ...terms, service: next, privacy: next });
  };

  return (
    <>
      <OnboardingHeader onBack={onBack} />

      <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-10 pb-6">
        <h1 className="typography-title-md text-main">
          서비스 이용을 위해
          <br />
          이용약관 동의가 필요합니다
        </h1>

        <section className="mt-11 flex flex-col gap-5">
          <button
            type="button"
            role="checkbox"
            aria-checked={allChecked}
            onClick={toggleAll}
            className="flex w-full items-center justify-between border-b border-line pb-5 text-left"
          >
            <span className="typography-title-xs text-main">전체 동의</span>
            <AgreementCheckIcon checked={allChecked} />
          </button>

          <div className="flex flex-col gap-6">
            <TermRow
              checked={termsAndPrivacyChecked}
              label="이용약관 및 개인정보취급방침"
              onToggle={toggleTermsAndPrivacy}
            >
              <TermLink onClick={() => onOpenDetail('service')}>이용약관</TermLink>
              <span className="text-[16px] leading-[1.4] font-normal tracking-[-0.03em] text-hint">
                {' '}
                및{' '}
              </span>
              <TermLink onClick={() => onOpenDetail('privacy')}>개인정보취급방침</TermLink>
              <TermTag required />
            </TermRow>

            <TermRow
              checked={terms.over14}
              label="만 14세 이상 확인"
              onToggle={() => toggle('over14')}
            >
              <span className="text-[16px] leading-[1.4] font-normal tracking-[-0.03em] text-hint">
                만 14세 이상 확인
              </span>
              <TermTag required />
            </TermRow>

            <TermRow
              checked={terms.location}
              label="위치기반서비스 이용약관"
              onToggle={() => toggle('location')}
            >
              <TermLink onClick={() => onOpenDetail('location')}>위치기반서비스 이용약관</TermLink>
              <TermTag required={false} />
            </TermRow>
          </div>
        </section>
      </main>

      <OnboardingBottomButton disabled={!canProceed} onClick={onNext}>
        다음
      </OnboardingBottomButton>
    </>
  );
}
