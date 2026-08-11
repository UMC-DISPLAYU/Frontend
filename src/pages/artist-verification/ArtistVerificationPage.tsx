import { useEffect, useState } from 'react';

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

import {
  type ArtistVerificationFormValues,
  artistVerificationSchema,
} from './artistVerification.schema';

type EmailState = 'idle' | 'sent' | 'error';
type CodeState = 'idle' | 'confirmed' | 'mismatch';

export function ArtistVerificationPage() {
  const navigate = useNavigate();
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [emailState, setEmailState] = useState<EmailState>('idle');
  const [codeState, setCodeState] = useState<CodeState>('idle');
  const [complete, setComplete] = useState(false);
  const schoolQuery = useSearchSchools(school);
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

  const isMailSent = emailState === 'sent';
  const isCodeConfirmed = codeState === 'confirmed';
  const shouldShowProfileFields = isMailSent && isCodeConfirmed;
  const isArtistNameValid = artistVerificationSchema.safeParse({ artistName }).success;

  const canSubmit =
    school.trim() &&
    email.trim() &&
    isCodeConfirmed &&
    isArtistNameValid &&
    selectedFields.length > 0;

  const handleSendMail = () => {
    if (!school.trim() || !email.trim()) {
      setEmailState('error');
      return;
    }

    sendVerificationEmail.mutate(
      { schoolEmail: email.trim(), univName: school.trim() },
      {
        onSuccess: () => {
          setEmailState('sent');
          setCodeState('idle');
        },
        onError: () => {
          setEmailState('error');
        },
      },
    );
  };

  const handleResendMail = () => {
    if (!school.trim() || !email.trim()) {
      setEmailState('error');
      return;
    }

    resendVerificationEmail.mutate(
      { schoolEmail: email.trim(), univName: school.trim() },
      {
        onSuccess: () => {
          setEmailState('sent');
          setCodeState('idle');
        },
        onError: () => {
          setEmailState('error');
        },
      },
    );
  };

  const handleConfirmCode = () => {
    if (!email.trim() || code.trim().length !== 6) {
      setCodeState('mismatch');
      return;
    }

    confirmVerificationEmail.mutate(
      { schoolEmail: email.trim(), verificationCode: code.trim() },
      {
        onSuccess: () => {
          setCodeState('confirmed');
        },
        onError: () => {
          setCodeState('mismatch');
        },
      },
    );
  };

  const handleComplete = (data: ArtistVerificationFormValues) => {
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
  };

  const handleSelectSchool = (value: string) => {
    setSchool(value);
    setShowSchoolSuggestions(false);
    setEmailState('idle');
    setCodeState('idle');
  };

  if (complete) {
    return <ArtistVerificationComplete onDone={() => navigate('/my')} />;
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-page">
      <main className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page px-5 pt-[58px]">
        <ArtistVerificationHeader onBack={() => navigate(-1)} />

        <form
          id="artist-verification-form"
          onSubmit={handleSubmit(handleComplete)}
          className="min-h-0 flex-1 overflow-y-auto pb-6 pt-5"
        >
          <h2 className="typo-body-xl-bold text-main">작가 인증 정보를 입력해주세요</h2>

          <div className="mt-5">
            <SchoolSearchField
              value={school}
              onChange={(value) => {
                setSchool(value);
                setShowSchoolSuggestions(true);
                setEmailState('idle');
                setCodeState('idle');
              }}
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
            value={email}
            onChange={(value) => {
              setEmail(value);
              setEmailState('idle');
              setCodeState('idle');
            }}
            onSend={handleSendMail}
            sent={isMailSent}
            error={emailState === 'error' ? '학교와 이메일을 확인해주세요.' : undefined}
            isSending={sendVerificationEmail.isPending}
          />

          {isMailSent ? (
            <CodeVerificationField
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeState('idle');
              }}
              onConfirm={handleConfirmCode}
              onResend={handleResendMail}
              confirmed={isCodeConfirmed}
              error={codeState === 'mismatch' ? '인증번호가 일치하지 않아요.' : undefined}
              isConfirming={confirmVerificationEmail.isPending}
              isResending={resendVerificationEmail.isPending}
            />
          ) : null}

          {shouldShowProfileFields ? (
            <>
              {(() => {
                const { onChange: regOnChange, onBlur, ref, name } = register('artistName');
                return (
                  <ArtistProfileSection
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
          ) : null}
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
