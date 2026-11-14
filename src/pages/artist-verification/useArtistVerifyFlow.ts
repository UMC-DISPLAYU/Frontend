import { type FormEvent, useReducer, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { ApiError } from '@/api/apiError';
import type { ActivityFieldCode } from '@/components/artist-verify';
import { MAX_ARTIST_FIELDS } from '@/constants/exhibition';
import {
  useConfirmVerificationEmail,
  useResendVerificationEmail,
  useSearchSchools,
  useSendVerificationEmail,
} from '@/hooks/queries/useSchoolEmailVerification';
import { useCreateMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { toast } from '@/stores/toastStore';
import { getErrorMessage, isRequestCanceled } from '@/utils/error';

import {
  type ArtistVerificationFormValues,
  artistVerificationSchema,
} from './artistVerification.schema';
import {
  getVerificationErrorMessage,
  initialState,
  verificationReducer,
} from './verificationState';

/* 피그마 개선안 문구. 여기 없는 오류 코드는 기존 verificationState 문구를 쓴다. */
const DESIGN_ERROR_MESSAGES: Record<string, string> = {
  SCHOOL_EMAIL_DOMAIN_MISMATCH: '선택한 학교의 웹메일과 일치하지 않아요.',
  DUPLICATE_SCHOOL_EMAIL: '이미 다른 계정에서 사용 중인 웹메일이에요.',
  VERIFICATION_CODE_MISMATCH: '인증번호가 일치하지 않아요.',
  VERIFICATION_CODE_EXPIRED: '인증 시간이 지났어요. 인증 메일을 다시 받아주세요.',
};

/* 입력한 이메일을 고쳐야 하는 오류는 입력창 아래에, 나머지 발송 실패는 토스트로 알린다. */
const EMAIL_FIELD_ERROR_CODES = new Set([
  'SCHOOL_EMAIL_DOMAIN_MISMATCH',
  'DUPLICATE_SCHOOL_EMAIL',
  'INVALID_EMAIL_FORMAT',
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getClientErrorCode = (error: unknown) =>
  error instanceof ApiError && (!error.status || error.status < 500) ? error.code : undefined;

const getMessage = (error: unknown, fallback: string) => {
  const code = getClientErrorCode(error);
  return (code && DESIGN_ERROR_MESSAGES[code]) || getVerificationErrorMessage(error, fallback);
};

export function useArtistVerifyFlow() {
  const [state, dispatch] = useReducer(verificationReducer, initialState);
  const [selectedFields, setSelectedFields] = useState<ActivityFieldCode[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const savingRef = useRef(false);
  // 버튼이 비활성화되기 전에 연속으로 눌린 메일 발송 · 인증 확인 요청을 막는다
  const verifyingRef = useRef(false);

  const schoolQuery = useSearchSchools(state.school);
  const sendMail = useSendVerificationEmail();
  const resendMail = useResendVerificationEmail();
  const confirmCode = useConfirmVerificationEmail();
  const createArtistProfile = useCreateMyArtistProfile();

  const form = useForm<ArtistVerificationFormValues>({
    resolver: zodResolver(artistVerificationSchema),
    mode: 'onChange',
    defaultValues: { artistName: '' },
  });
  const artistName = useWatch({ control: form.control, name: 'artistName' }) ?? '';

  const isMailSent = state.completedSteps.has('email');
  const isCodeConfirmed = state.completedSteps.has('code');
  const isVerifying = sendMail.isPending || resendMail.isPending || confirmCode.isPending;
  const isSaving = createArtistProfile.isPending;
  const canSendMail = Boolean(
    state.isSchoolSelected && state.school.trim() && EMAIL_PATTERN.test(state.email.trim()),
  );
  const hasInput = Boolean(
    state.school.trim() || state.email.trim() || artistName.trim() || selectedFields.length,
  );

  const canSubmit = Boolean(
    canSendMail &&
    isCodeConfirmed &&
    artistVerificationSchema.safeParse({ artistName }).success &&
    selectedFields.length > 0,
  );

  const requestMail = (mutation: typeof sendMail, successToast?: string) => {
    if (!canSendMail || verifyingRef.current) return;
    verifyingRef.current = true;
    mutation.mutate(
      { schoolEmail: state.email.trim(), univName: state.school.trim() },
      {
        onSettled: () => {
          verifyingRef.current = false;
        },
        onSuccess: () => {
          dispatch({ type: 'COMPLETE_STEP', payload: 'email' });
          if (successToast) toast(successToast);
        },
        onError: (error) => {
          if (isRequestCanceled(error)) return;
          const message = getMessage(error, '메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.');
          const code = getClientErrorCode(error);
          if (code && EMAIL_FIELD_ERROR_CODES.has(code)) {
            dispatch({ type: 'FAIL_STEP', payload: { step: 'email', error: message } });
            return;
          }
          toast(message);
        },
      },
    );
  };

  const sendVerificationMail = () =>
    isMailSent ? requestMail(resendMail, '인증 메일을 다시 보냈어요') : requestMail(sendMail);

  const confirmVerificationCode = () => {
    const verificationCode = state.code.trim();
    if (verificationCode.length !== 6 || verifyingRef.current) return;
    verifyingRef.current = true;

    confirmCode.mutate(
      { schoolEmail: state.email.trim(), verificationCode },
      {
        onSettled: () => {
          verifyingRef.current = false;
        },
        onSuccess: () => dispatch({ type: 'COMPLETE_STEP', payload: 'code' }),
        onError: (error) => {
          if (isRequestCanceled(error)) return;
          dispatch({
            type: 'FAIL_STEP',
            payload: {
              step: 'code',
              error: getMessage(error, '인증번호를 확인하지 못했어요. 다시 시도해주세요.'),
            },
          });
        },
      },
    );
  };

  const notifyMaxFieldsExceeded = () =>
    toast(`분야는 최대 ${MAX_ARTIST_FIELDS}개까지 선택할 수 있어요`);

  const saveArtistProfile = async (values: ArtistVerificationFormValues) => {
    // 상태 업데이트 전에 연속으로 눌린 제출을 막는다
    if (!canSubmit || savingRef.current) return;
    savingRef.current = true;
    try {
      await createArtistProfile.mutateAsync({
        artistName: values.artistName.trim(),
        activityFields: selectedFields,
      });
      setIsComplete(true);
    } catch (error) {
      toast(getErrorMessage(error, '작가 프로필을 저장하지 못했어요. 다시 시도해주세요.'));
    } finally {
      savingRef.current = false;
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => form.handleSubmit(saveArtistProfile)(event);

  return {
    school: state.school,
    email: state.email,
    code: state.code,
    emailGeneration: state.emailGeneration,
    setSchool: (value: string) => dispatch({ type: 'SET_SCHOOL', payload: value }),
    selectSchool: (value: string) => dispatch({ type: 'SELECT_SCHOOL', payload: value }),
    isSchoolSelected: state.isSchoolSelected,
    setEmail: (value: string) => dispatch({ type: 'SET_EMAIL', payload: value }),
    setCode: (value: string) => dispatch({ type: 'SET_CODE', payload: value }),
    schoolSuggestions: schoolQuery.data ?? [],
    isSchoolLoading: schoolQuery.isLoading,
    emailError: state.failedStep === 'email' ? (state.errorMessage ?? undefined) : undefined,
    codeError: state.failedStep === 'code' ? (state.errorMessage ?? undefined) : undefined,
    canSendMail,
    isMailSent,
    isCodeConfirmed,
    isVerifying,
    isSendingMail: sendMail.isPending || resendMail.isPending,
    isConfirmingCode: confirmCode.isPending,
    sendVerificationMail,
    confirmVerificationCode,
    registerArtistName: form.register('artistName'),
    artistNameError: form.formState.errors.artistName?.message,
    selectedFields,
    changeFields: setSelectedFields,
    notifyMaxFieldsExceeded,
    canSubmit,
    isSaving,
    submit,
    isComplete,
    hasInput,
  };
}
