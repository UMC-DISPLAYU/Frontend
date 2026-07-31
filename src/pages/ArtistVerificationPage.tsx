import { useState } from 'react';

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

type EmailState = 'idle' | 'sent' | 'schoolMismatch';
type CodeState = 'idle' | 'confirmed' | 'mismatch';

export function ArtistVerificationPage() {
  const navigate = useNavigate();
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [profileName, setProfileName] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [emailState, setEmailState] = useState<EmailState>('idle');
  const [codeState, setCodeState] = useState<CodeState>('idle');
  const [complete, setComplete] = useState(false);

  const isMailSent = emailState === 'sent';
  const isCodeConfirmed = codeState === 'confirmed';
  const shouldShowProfileFields = isMailSent && isCodeConfirmed;
  const canSubmit =
    school.trim() &&
    email.trim() &&
    isCodeConfirmed &&
    profileName.trim() &&
    selectedFields.length > 0;

  const toggleField = (field: string) => {
    setSelectedFields((current) => {
      if (current.includes(field)) return current.filter((item) => item !== field);
      if (current.length >= 2) return current;
      return [...current, field];
    });
  };

  const handleSendMail = () => {
    setEmailState(school && email ? 'sent' : 'schoolMismatch');
    setCodeState('idle');
  };

  const handleConfirmCode = () => {
    setCodeState(code.length === 6 ? 'confirmed' : 'mismatch');
  };

  if (complete) {
    return <ArtistVerificationComplete onDone={() => navigate('/my')} />;
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-page">
      <main className="flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-page px-5 pt-[58px]">
        <ArtistVerificationHeader onBack={() => navigate(-1)} />

        <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-5">
          <h2 className="typo-body-xl-bold text-main">작가 인증 정보를 입력해주세요</h2>

          <div className="mt-5">
            <SchoolSearchField
              value={school}
              onChange={(value) => {
                setSchool(value);
                setShowSchoolSuggestions(true);
              }}
              showSuggestions={showSchoolSuggestions}
              onFocus={() => setShowSchoolSuggestions(true)}
              onSelect={(value) => {
                setSchool(value);
                setShowSchoolSuggestions(false);
              }}
            />
          </div>

          <EmailVerificationField
            value={email}
            onChange={(value) => {
              setEmail(value);
              setEmailState('idle');
            }}
            onSend={handleSendMail}
            sent={isMailSent}
            error={
              emailState === 'schoolMismatch'
                ? '선택한 학교의 웹메일과 일치하지 않습니다.'
                : undefined
            }
          />

          {isMailSent ? (
            <CodeVerificationField
              value={code}
              onChange={(value) => {
                setCode(value);
                setCodeState('idle');
              }}
              onConfirm={handleConfirmCode}
              onResend={() => {
                setEmailState('sent');
                setCodeState('idle');
              }}
              confirmed={isCodeConfirmed}
              error={codeState === 'mismatch' ? '인증번호가 일치하지 않아요.' : undefined}
            />
          ) : null}

          {shouldShowProfileFields ? (
            <>
              <ArtistProfileSection value={profileName} onChange={setProfileName} />
              <ArtistFieldSelector selectedFields={selectedFields} onToggle={toggleField} />
            </>
          ) : null}
        </div>

        <ArtistVerificationBottomButton disabled={!canSubmit} onClick={() => setComplete(true)}>
          인증확인
        </ArtistVerificationBottomButton>
      </main>
    </div>
  );
}
