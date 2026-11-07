import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { PageContainer } from '@/components/layout';
import {
  NicknameScreen,
  type PolicyTermKey,
  SignupCompleteScreen,
  TermDetailScreen,
  TermsAgreementScreen,
  type TermState,
} from '@/components/onboarding';

import { findAgreement } from './signupAgreements';
import { useOnboardingSignup } from './useOnboardingSignup';

type Step = 'terms' | 'termDetail' | 'nickname' | 'done';

const INITIAL_TERMS: TermState = { over14: false, service: false, privacy: false, location: false };

export function NewOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('terms');
  const [selectedTerm, setSelectedTerm] = useState<PolicyTermKey>('service');
  const [terms, setTerms] = useState<TermState>(INITIAL_TERMS);
  const signup = useOnboardingSignup(terms);

  /* 단계는 같은 URL 안에서 바뀌어 ScrollRestoration 이 처리하지 않으므로 직접 맨 위로 올린다 */
  const goTo = (next: Step) => {
    setStep(next);
    window.scrollTo(0, 0);
  };

  return (
    <PageContainer variant="form" className="bg-primary-white">
      {step === 'terms' ? (
        <TermsAgreementScreen
          terms={terms}
          onChange={setTerms}
          onBack={() => navigate('/login')}
          onOpenDetail={(key) => {
            setSelectedTerm(key);
            goTo('termDetail');
          }}
          onNext={() => goTo('nickname')}
        />
      ) : null}

      {step === 'termDetail' ? (
        <TermDetailScreen
          termKey={selectedTerm}
          agreement={findAgreement(signup.agreements, selectedTerm)}
          isLoading={signup.isAgreementsLoading}
          onRetry={() => void signup.refetchAgreements()}
          onBack={() => goTo('terms')}
        />
      ) : null}

      {step === 'nickname' ? (
        <NicknameScreen
          isSubmitting={signup.isSubmitting}
          submitError={signup.error}
          onBack={() => goTo('terms')}
          onSubmit={async (nickname) => {
            if (await signup.submit(nickname)) goTo('done');
          }}
        />
      ) : null}

      {step === 'done' ? (
        <SignupCompleteScreen onNext={() => navigate('/home', { replace: true })} />
      ) : null}
    </PageContainer>
  );
}
