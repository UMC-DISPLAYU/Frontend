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
} from '@/constants/exhibition';
import {
  useConfirmVerificationEmail,
  useResendVerificationEmail,
  useSearchSchools,
  useSendVerificationEmail,
} from '@/hooks/queries/useSchoolEmailVerification';
import { useCreateMyArtistProfile } from '@/hooks/queries/useUserProfile';
import { useGoBackOrHome } from '@/hooks/useGoBackOrHome';
import { getErrorMessage } from '@/utils/error';

import {
  type ArtistVerificationFormValues,
  artistVerificationSchema,
} from './artistVerification.schema';

type VerificationStep = 'school' | 'email' | 'code' | 'profile';

interface VerificationState {
  school: string;
  email: string;
  code: string;
  completedSteps: Set<VerificationStep>;
  failedStep: VerificationStep | null;
  emailError: string | null;
}

type VerificationAction =
  | { type: 'SET_SCHOOL'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_CODE'; payload: string }
  | { type: 'COMPLETE_STEP'; payload: VerificationStep }
  | { type: 'FAIL_STEP'; payload: { step: VerificationStep; error?: string } }
  | { type: 'RESET_FROM_STEP'; payload: VerificationStep };

const initialState: VerificationState = {
  school: '',
  email: '',
  code: '',
  completedSteps: new Set(),
  failedStep: null,
  emailError: null,
};

function verificationReducer(
  state: VerificationState,
  action: VerificationAction,
): VerificationState {
  switch (action.type) {
    case 'SET_SCHOOL': {
      const newState = { ...state, school: action.payload };
      newState.completedSteps = new Set();
      newState.failedStep = null;
      newState.emailError = null;
      newState.email = '';
      newState.code = '';
      return newState;
    }

    case 'SET_EMAIL': {
      const newState = { ...state, email: action.payload };
      newState.completedSteps = new Set();
      newState.failedStep = null;
      newState.emailError = null;
      newState.code = '';
      return newState;
    }

    case 'SET_CODE':
      return { ...state, code: action.payload };

    case 'COMPLETE_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      newCompletedSteps.add(action.payload);
      return {
        ...state,
        completedSteps: newCompletedSteps,
        failedStep: null,
        emailError: null,
      };
    }

    case 'FAIL_STEP':
      return {
        ...state,
        failedStep: action.payload.step,
        emailError: action.payload.error ?? null,
      };

    case 'RESET_FROM_STEP': {
      const newCompletedSteps = new Set(state.completedSteps);
      const stepOrder: VerificationStep[] = ['school', 'email', 'code', 'profile'];
      const stepIndex = stepOrder.indexOf(action.payload);
      for (let i = stepIndex; i < stepOrder.length; i++) {
        newCompletedSteps.delete(stepOrder[i]);
      }
      return { ...state, completedSteps: newCompletedSteps };
    }

    default:
      return state;
  }
}

export function ArtistVerificationPage() {
  const navigate = useNavigate();
  const goBackOrHome = useGoBackOrHome();
  const [state, dispatch] = useReducer(verificationReducer, initialState);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
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
          dispatch({
            type: 'FAIL_STEP',
            payload: {
              step: 'email',
              error: getErrorMessage(error, '학교와 이메일을 확인해주세요.'),
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
          dispatch({
            type: 'FAIL_STEP',
            payload: {
              step: 'email',
              error: getErrorMessage(error, '인증번호 재발송에 실패했어요.'),
            },
          });
        },
      },
    );
  }, [state.school, state.email, resendVerificationEmail]);

  const handleConfirmCode = useCallback(() => {
    if (!state.email.trim() || state.code.trim().length !== 6) {
      dispatch({ type: 'FAIL_STEP', payload: { step: 'code' } });
      return;
    }

    confirmVerificationEmail.mutate(
      { schoolEmail: state.email.trim(), verificationCode: state.code.trim() },
      {
        onSuccess: () => {
          dispatch({ type: 'COMPLETE_STEP', payload: 'code' });
        },
        onError: () => {
          dispatch({ type: 'FAIL_STEP', payload: { step: 'code' } });
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
      <main className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page px-5 pt-[58px]">
        <ArtistVerificationHeader onBack={() => goBackOrHome()} />

        <form
          id="artist-verification-form"
          onSubmit={handleSubmit(handleComplete)}
          className="min-h-0 flex-1 overflow-y-auto pb-6 pt-5"
        >
          <h2 className="typo-body-xl-bold text-main">작가 인증 정보를 입력해주세요</h2>

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
            error={state.failedStep === 'email' ? (state.emailError ?? undefined) : undefined}
            isSending={sendVerificationEmail.isPending}
          />

          {isEmailStepCompleted && (
            <>
              <CodeVerificationField
                value={state.code}
                onChange={(value) => dispatch({ type: 'SET_CODE', payload: value })}
                onConfirm={handleConfirmCode}
                onResend={handleResendMail}
                confirmed={isCodeStepCompleted}
                disabled={isCodeStepCompleted}
                error={state.failedStep === 'code' ? '인증번호가 일치하지 않아요.' : undefined}
                isConfirming={confirmVerificationEmail.isPending}
                isResending={resendVerificationEmail.isPending}
              />
            </>
          )}

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
              <ArtistFieldSelector selectedFields={selectedFields} onChange={setSelectedFields} />
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
