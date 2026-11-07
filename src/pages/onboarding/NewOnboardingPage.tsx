import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-primary-white">
      {step === 'terms' ? (
        <TermsAgreementScreen
          terms={terms}
          onChange={setTerms}
          onBack={() => navigate('/login')}
          onOpenDetail={(key) => {
            setSelectedTerm(key);
            setStep('termDetail');
          }}
          onNext={() => setStep('nickname')}
        />
      ) : null}

      {step === 'termDetail' ? (
        <TermDetailScreen
          termKey={selectedTerm}
          agreement={findAgreement(signup.agreements, selectedTerm)}
          isLoading={signup.isAgreementsLoading}
          onRetry={() => void signup.refetchAgreements()}
          onBack={() => setStep('terms')}
        />
      ) : null}

      {step === 'nickname' ? (
        <NicknameScreen
          isSubmitting={signup.isSubmitting}
          submitError={signup.error}
          onBack={() => setStep('terms')}
          onSubmit={async (nickname) => {
            if (await signup.submit(nickname)) setStep('done');
          }}
        />
      ) : null}

      {step === 'done' ? (
        <SignupCompleteScreen onNext={() => navigate('/home', { replace: true })} />
      ) : null}
    </div>
  );
}
