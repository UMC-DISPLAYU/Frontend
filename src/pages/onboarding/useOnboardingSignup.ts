import { useState } from 'react';

import { SessionChangedError } from '@/api/apiError';
import type { TermState } from '@/components/onboarding';
import { useAgreements } from '@/hooks/queries/useAgreements';
import { useSignup } from '@/hooks/queries/useAuth';
import { useAuthStore } from '@/stores/authStore';

import { buildSignupAgreements, hasRequiredTerms } from './signupAgreements';
import { getSignupErrorMessage } from './signupError';

export function useOnboardingSignup(terms: TermState) {
  const [error, setError] = useState('');
  const agreementsQuery = useAgreements();
  const signup = useSignup();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  /** 가입에 성공하면 true. 실패 사유는 `error`에 담는다. */
  const submit = async (nickname: string) => {
    if (signup.isPending) return false;
    setError('');

    if (!hasRequiredTerms(terms)) {
      setError('필수 약관에 모두 동의해주세요.');
      return false;
    }

    if (!agreementsQuery.data) {
      setError(
        agreementsQuery.isError
          ? '약관 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'
          : '약관 정보를 불러오는 중이에요. 잠시 후 다시 시도해주세요.',
      );
      return false;
    }

    const agreements = buildSignupAgreements(terms, agreementsQuery.data);
    if (!agreements) {
      setError('필수 약관 동의 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return false;
    }

    try {
      const result = await signup.mutateAsync({ nickname, agreements, isOver14: terms.over14 });
      setAccessToken(result.accessToken);
      return true;
    } catch (err) {
      if (!(err instanceof SessionChangedError)) {
        setError(getSignupErrorMessage(err));
      }
      return false;
    }
  };

  return {
    submit,
    isSubmitting: signup.isPending,
    error,
  };
}
