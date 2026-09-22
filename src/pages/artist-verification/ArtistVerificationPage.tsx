import { useCallback, useReducer, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  ArtistFieldSelector,
  ArtistProfileSection,
  ArtistVerificationBottomButton,
  ArtistVerificationComplete,
  ArtistVerificationHeader,
  CodeVerificationField,
  EmailVerificationField,
  SchoolSearchField,
} from '@/components/artist-verification';
import {
  ARTIST_FIELD_MAP,
  type ArtistFieldCode,
  type ExhibitionField,
  MAX_ARTIST_FIELDS,
} from '@/constants/exhibition';
import {
  useConfirmVerificationEmail,
  useResendVerificationEmail,
  useSearchSchools,
  useSendVerificationEmail,
} from '@/hooks/queries/useSchoolEmailVerification';
import { useCreateMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';
import { isRequestCanceled } from '@/utils/error';

import {
  type ArtistVerificationFormValues,
  artistVerificationSchema,
} from './artistVerification.schema';
import {
  getVerificationErrorMessage,
  initialState,
  verificationReducer,
} from './verificationState';

export function ArtistVerificationPage() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const [state, dispatch] = useReducer(verificationReducer, initialState);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldError, setFieldError] = useState('');
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [complete, setComplete] = useState(false);

  const schoolQuery = useSearchSchools(state.school);
  const sendVerificationEmail = useSendVerificationEmail();
  const resendVerificationEmail = useResendVerificationEmail();
  const confirmVerificationEmail = useConfirmVerificationEmail();
  const createMyArtistProfile = useCreateMyArtistProfile();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ArtistVerificationFormValues>({
    resolver: zodResolver(artistVerificationSchema),
    mode: 'onChange',
    defaultValues: {
      artistName: '',
    },
  });

  const artistName = useWatch({ control, name: 'artistName' }) ?? '';

  const isEmailStepCompleted = state.completedSteps.has('email');
  const isCodeStepCompleted = state.completedSteps.has('code');
  const isArtistNameValid = artistVerificationSchema.safeParse({ artistName }).success;

  const canSubmit =
    state.school.trim() &&
    state.email.trim() &&
    isCodeStepCompleted &&
    isArtistNameValid &&
    selectedFields.length > 0;

  const handleSendMail = useCallback(() => {
    if (!state.school.trim() || !state.email.trim()) {
      dispatch({
        type: 'FAIL_STEP',
        payload: { step: 'email', error: '학교와 이메일을 확인해주세요.' },
      });
      return;
    }

    sendVerificationEmail.mutate(
      { schoolEmail: state.email.trim(), univName: state.school.trim() },
      {
        onSuccess: () => {
          dispatch({ type: 'COMPLETE_STEP', payload: 'email' });
        },
        onError: (error) => {
          if (isRequestCanceled(error)) return;
          dispatch({
            type: 'FAIL_STEP',
            payload: {
              step: 'email',
              error: getVerificationErrorMessage(error, '학교와 이메일을 확인해주세요.'),
            },
          });
        },
      },
    );
  }, [state.school, state.email, sendVerificationEmail]);

  const handleResendMail = useCallback(() => {
    if (!state.school.trim() || !state.email.trim()) {
      dispatch({
        type: 'FAIL_STEP',
        payload: { step: 'email', error: '학교와 이메일을 확인해주세요.' },
      });
      return;
    }

    resendVerificationEmail.mutate(
      { schoolEmail: state.email.trim(), univName: state.school.trim() },
      {
        onSuccess: () => {
          dispatch({ type: 'COMPLETE_STEP', payload: 'email' });
        },
        onError: (error) => {
          if (isRequestCanceled(error)) return;
          dispatch({
            type: 'FAIL_STEP',
            payload: {
              step: 'email',
              error: getVerificationErrorMessage(error, '인증번호 재발송에 실패했어요.'),
            },
          });
        },
      },
    );
  }, [state.school, state.email, resendVerificationEmail]);

  const handleConfirmCode = useCallback(() => {
    if (!state.email.trim() || state.code.trim().length !== 6) {
      dispatch({
        type: 'FAIL_STEP',
        payload: { step: 'code', error: '인증번호 6자리를 입력해주세요.' },
      });
      return;
    }

    confirmVerificationEmail.mutate(
      { schoolEmail: state.email.trim(), verificationCode: state.code.trim() },
      {
        onSuccess: () => {
          dispatch({ type: 'COMPLETE_STEP', payload: 'code' });
        },
        onError: (error) => {
          if (isRequestCanceled(error)) return;
          dispatch({
            type: 'FAIL_STEP',
            payload: {
              step: 'code',
              error: getVerificationErrorMessage(
                error,
                '인증번호를 확인하지 못했어요. 다시 시도해주세요.',
              ),
            },
          });
        },
      },
    );
  }, [state.email, state.code, confirmVerificationEmail]);

  const handleComplete = useCallback(
    (data: ArtistVerificationFormValues) => {
      const activityFields = selectedFields
        .map((field) => ARTIST_FIELD_MAP[field as ExhibitionField])
        .filter((field): field is ArtistFieldCode => Boolean(field));

      if (activityFields.length === 0) return;

      createMyArtistProfile.mutate(
        {
          artistName: data.artistName.trim(),
          activityFields,
        },
        {
          onSuccess: () => {
            setComplete(true);
          },
        },
      );
    },
    [selectedFields, createMyArtistProfile],
  );

  const handleSelectSchool = useCallback((value: string) => {
    setShowSchoolSuggestions(false);
    dispatch({ type: 'SET_SCHOOL', payload: value });
  }, []);

  if (complete) {
    return <ArtistVerificationComplete onDone={() => navigate('/my')} />;
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-page">
      <main className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page px-5">
        <ArtistVerificationHeader onBack={() => flowBack()} />

        <form
          id="artist-verification-form"
          onSubmit={handleSubmit(handleComplete)}
          className="min-h-0 flex-1 overflow-y-auto pb-6 pt-5"
        >
          <h2 className="typo-body-xl-bold text-main">작가 인증 정보를 입력해주세요</h2>

          <fieldset
            disabled={
              sendVerificationEmail.isPending ||
              resendVerificationEmail.isPending ||
              confirmVerificationEmail.isPending
            }
            className="contents"
          >
            <div className="mt-5">
              <SchoolSearchField
                value={state.school}
                onChange={(value) => dispatch({ type: 'SET_SCHOOL', payload: value })}
                suggestions={schoolQuery.data ?? []}
                showSuggestions={showSchoolSuggestions}
                onFocus={() => setShowSchoolSuggestions(true)}
                onBlur={() => {
                  window.setTimeout(() => setShowSchoolSuggestions(false), 120);
                }}
                onSelect={handleSelectSchool}
                isLoading={schoolQuery.isLoading}
              />
            </div>

            <EmailVerificationField
              value={state.email}
              onChange={(value) => dispatch({ type: 'SET_EMAIL', payload: value })}
              onSend={handleSendMail}
              sent={isEmailStepCompleted}
              error={state.failedStep === 'email' ? (state.errorMessage ?? undefined) : undefined}
              isSending={sendVerificationEmail.isPending}
            />

            {isEmailStepCompleted && (
              <>
                <CodeVerificationField
                  key={state.emailGeneration}
                  value={state.code}
                  onChange={(value) => dispatch({ type: 'SET_CODE', payload: value })}
                  onConfirm={handleConfirmCode}
                  onResend={handleResendMail}
                  confirmed={isCodeStepCompleted}
                  disabled={isCodeStepCompleted}
                  error={
                    state.failedStep === 'code' ? (state.errorMessage ?? undefined) : undefined
                  }
                  isConfirming={confirmVerificationEmail.isPending}
                  isResending={resendVerificationEmail.isPending}
                />
              </>
            )}
          </fieldset>

          {isCodeStepCompleted && (
            <>
              {(() => {
                const { onChange: regOnChange, onBlur, ref, name } = register('artistName');
                return (
                  <ArtistProfileSection
                    value={artistName}
                    error={Boolean(errors.artistName)}
                    name={name}
                    onBlur={onBlur}
                    ref={ref}
                    registerOnChange={regOnChange}
                  />
                );
              })()}
              {errors.artistName?.message && (
                <p className="mt-1 typo-body-xxs-regular text-error px-3">
                  {errors.artistName.message}
                </p>
              )}
              <ArtistFieldSelector
                selectedFields={selectedFields}
                onChange={(fields) => {
                  setFieldError('');
                  setSelectedFields(fields);
                }}
                onMaxSelectExceeded={() =>
                  setFieldError(`분야는 최대 ${MAX_ARTIST_FIELDS}개까지만 선택할 수 있습니다.`)
                }
              />
              {fieldError && (
                <p className="mt-1 typo-body-xxs-regular text-error px-3">{fieldError}</p>
              )}
            </>
          )}
        </form>

        <ArtistVerificationBottomButton
          form="artist-verification-form"
          type="submit"
          disabled={!canSubmit || createMyArtistProfile.isPending}
        >
          인증확인
        </ArtistVerificationBottomButton>
      </main>
    </div>
  );
}
