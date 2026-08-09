import { useState } from 'react';

import { ArrowLeft, Check, ChevronLeft, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/axios';
import type { AgreementDto } from '@/api/dto';
import { useAgreements } from '@/hooks/queries/useAgreements';
import { useSignup } from '@/hooks/queries/useAuth';
import { useCheckNickname } from '@/hooks/queries/useUserProfile';
import { useAuthStore } from '@/stores/authStore';

type Step = 'terms' | 'termsDetail' | 'nickname' | 'done';
type TermKey = 'over14' | 'service' | 'privacy' | 'location';
type AgreementKey = Exclude<TermKey, 'over14'>;
type TermState = Record<TermKey, boolean>;
type NicknameStatus = 'idle' | 'available' | 'unavailable' | 'error';
type ParsedPolicyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string };

const AGREEMENT_CODES: Record<AgreementKey, string> = {
  service: 'TERMS_OF_SERVICE',
  privacy: 'PRIVACY_COLLECTION_USE',
  location: 'LOCATION_BASED_SERVICE',
};

function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-page">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page">
        {children}
      </div>
    </div>
  );
}

function BackButton({
  onBack,
  icon = 'chevron',
}: {
  onBack: () => void;
  icon?: 'chevron' | 'arrow';
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로가기"
      className="flex shrink-0 items-center justify-start"
    >
      {icon === 'arrow' ? (
        <ArrowLeft className="size-5 text-main" strokeWidth={2} />
      ) : (
        <ChevronLeft size={35} className="text-main" strokeWidth={1.5} />
      )}
    </button>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
  className = '',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-center rounded-xl bg-main typo-body-sm-semibold text-white disabled:bg-bt-gray disabled:text-white ${className}`}
    >
      {children}
    </button>
  );
}

function AgreementCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
        checked ? 'border-2 border-main bg-main' : 'border-2 border-line'
      }`}
    >
      {checked ? <Check className="size-4 text-white" strokeWidth={2.4} /> : null}
    </span>
  );
}

function CheckButton({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0">
      <AgreementCheck checked={checked} />
    </button>
  );
}

function InfoNotice({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 rounded-xl bg-[#F9F9F9] p-3.5">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 shrink-0 text-faint" strokeWidth={1.5} size={12} />
        <p className="min-w-0 flex-1 typo-body-xs-regular text-faint">{children}</p>
      </div>
    </div>
  );
}

function TermsScreen({
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
  onOpenDetail: (key: AgreementKey) => void;
}) {
  const allChecked = Object.values(terms).every(Boolean);
  const termsAndPrivacyChecked = terms.service && terms.privacy;
  const canProceed = terms.over14 && terms.service && terms.privacy;

  const toggle = (key: TermKey | 'all' | 'termsAndPrivacy') => {
    if (key === 'all') {
      const next = !allChecked;
      onChange({ over14: next, service: next, privacy: next, location: next });
      return;
    }
    if (key === 'termsAndPrivacy') {
      const next = !termsAndPrivacyChecked;
      onChange({ ...terms, service: next, privacy: next });
      return;
    }
    onChange({ ...terms, [key]: !terms[key] });
  };

  return (
    <main className="flex flex-1 flex-col px-5 pb-10 pt-14.5">
      <BackButton onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-10">
        <h2 className="typo-body-3xl-bold text-main">
          서비스 이용을 위해
          <br />
          이용약관 동의가 필요합니다
        </h2>

        <section className="mt-9">
          <button
            type="button"
            onClick={() => toggle('all')}
            className="flex h-14.5 w-full items-center border-b border-line text-left"
          >
            <span className="min-w-0 flex-1 typo-body-lg-bold text-main">전체 동의</span>
            <AgreementCheck checked={allChecked} />
          </button>

          <div className="mt-5 flex flex-col gap-5">
            <div className="flex min-h-9 items-center gap-3">
              <div className="min-w-0 flex-1 typo-body-md-regular">
                <button
                  type="button"
                  onClick={() => onOpenDetail('service')}
                  className="typo-body-md-semibold text-sub700 underline underline-offset-[3px]"
                >
                  이용약관
                </button>
                <span className="text-sub600"> 및 </span>
                <button
                  type="button"
                  onClick={() => onOpenDetail('privacy')}
                  className="typo-body-md-semibold text-sub700 underline underline-offset-[3px]"
                >
                  개인정보취급방침
                </button>
                <span className="ml-2 typo-body-sm-regular text-hint">(필수)</span>
              </div>
              <CheckButton
                checked={termsAndPrivacyChecked}
                onClick={() => toggle('termsAndPrivacy')}
              />
            </div>

            <div className="flex min-h-9 items-center gap-3">
              <span className="min-w-0 flex-1 typo-body-md-regular text-sub600">
                만 14세 이상 확인
                <span className="ml-1 typo-body-sm-regular text-hint">(필수)</span>
              </span>
              <CheckButton checked={terms.over14} onClick={() => toggle('over14')} />
            </div>

            <div className="flex min-h-9 items-center gap-3">
              <div className="min-w-0 flex-1 typo-body-md-regular">
                <button
                  type="button"
                  onClick={() => onOpenDetail('location')}
                  className="typo-body-md-semibold text-sub700 underline underline-offset-[3px]"
                >
                  위치기반서비스 이용약관
                </button>
                <span className="ml-2 typo-body-sm-regular text-hint">(선택)</span>
              </div>
              <CheckButton checked={terms.location} onClick={() => toggle('location')} />
            </div>
          </div>
        </section>
      </div>

      <PrimaryButton disabled={!canProceed} onClick={onNext}>
        다음
      </PrimaryButton>
    </main>
  );
}

function parsePolicyContent(content: string): ParsedPolicyBlock[] {
  return content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^(제\d+조|[0-9]+\.)\s/.test(line)) {
        return { type: 'heading', text: line };
      }
      if (/^[-•]\s+/.test(line)) {
        return { type: 'bullet', text: line.replace(/^[-•]\s+/, '') };
      }
      return { type: 'paragraph', text: line };
    });
}

function PolicyPlainContent({ content }: { content: string }) {
  const blocks = parsePolicyContent(content);

  return (
    <div className="pt-6">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}-${block.text}`;

        if (block.type === 'heading') {
          return (
            <h2 key={key} className="pt-8 typo-body-lg-bold text-main first:pt-0">
              {block.text}
            </h2>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={key} className="flex items-start gap-2.5 pt-1.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-bt-gray" />
              <p className="min-w-0 flex-1 whitespace-pre-wrap typo-body-md-regular text-sub700">
                {block.text}
              </p>
            </div>
          );
        }

        return (
          <p
            key={key}
            className="whitespace-pre-wrap pt-3 typo-body-md-regular text-sub700 first:pt-0"
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function TermsDetailScreen({
  agreement,
  onBack,
}: {
  agreement?: AgreementDto;
  onBack: () => void;
}) {
  const title = agreement?.title ?? '약관 상세';

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-page px-4 pb-px">
        <div className="h-9 w-7.5 flex items-center">
          <BackButton onBack={onBack} icon="arrow" />
        </div>
        <h1 className="typo-body-md-semibold text-main">{title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-8 pt-5">
        {!agreement ? (
          <div className="py-10 text-center typo-body-md-regular text-hint">
            약관 정보를 불러오는 중이거나 문제가 발생했습니다.
          </div>
        ) : (
          <>
            <p className="typo-body-xs-regular text-hint">
              시행일 {agreement.effectiveDate} · 버전 {agreement.version}
            </p>
            <PolicyPlainContent content={agreement.content} />
          </>
        )}
      </main>
    </>
  );
}

function NicknameScreen({
  isSubmitting,
  onBack,
  onSubmit,
  submitError,
}: {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (nickname: string) => void;
  submitError?: string;
}) {
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState<NicknameStatus>('idle');
  const [checkedNickname, setCheckedNickname] = useState('');
  const checkNickname = useCheckNickname();
  const isNicknameShapeValid = /^[가-힣a-zA-Z0-9]{2,15}$/.test(nickname);
  const canSubmit =
    status === 'available' && checkedNickname === nickname && isNicknameShapeValid && !isSubmitting;

  const handleCheckNickname = async () => {
    if (!isNicknameShapeValid || checkNickname.isPending) return;

    const targetNickname = nickname;

    try {
      const result = await checkNickname.mutateAsync({ nickname: targetNickname });
      if (targetNickname !== nickname) return;

      setCheckedNickname(targetNickname);
      setStatus(result.isAvailable ? 'available' : 'unavailable');
    } catch {
      if (targetNickname !== nickname) return;

      setStatus('error');
    }
  };

  const statusMessage =
    status === 'available'
      ? '사용 가능한 닉네임이에요.'
      : status === 'unavailable'
        ? '이미 사용 중인 닉네임이에요.'
        : status === 'error'
          ? '중복 확인에 실패했어요.'
          : '';

  return (
    <main className="flex h-full flex-1 flex-col bg-page px-5 pb-10 pt-14.5">
      <BackButton onBack={onBack} />

      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-10">
        <h2 className="typo-body-3xl-bold text-main">
          디유에서 사용할
          <br />
          닉네임을 정해주세요
        </h2>
        <p className="mt-3 typo-body-xs-regular text-hint">
          방명록, 게시판, 프로필에서 표시되는 이름이에요.
        </p>

        <section className="mt-9 flex w-full flex-col gap-3">
          <label className="typo-body-sm-bold text-main" htmlFor="nickname">
            닉네임
          </label>
          <div className="flex w-full items-center border-b border-line">
            <div className="flex h-9.5 min-w-0 flex-1 items-center px-3 py-2.5">
              <input
                id="nickname"
                value={nickname}
                maxLength={15}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setCheckedNickname('');
                  setStatus('idle');
                }}
                placeholder="닉네임"
                className="min-w-0 flex-1 bg-transparent typo-body-xs-regular text-main outline-none placeholder:text-input-placeholder"
              />
            </div>
            <div className="flex h-9.5 shrink-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setNickname('');
                  setCheckedNickname('');
                  setStatus('idle');
                }}
                aria-label="닉네임 지우기"
                className="flex size-5 items-center justify-center rounded-full bg-bt-gray"
              >
                <X className="size-3 text-white" strokeWidth={2.5} />
              </button>
              <div className="h-4.5 w-px bg-line" />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!isNicknameShapeValid || checkNickname.isPending}
                className="flex h-8 w-18 shrink-0 items-center justify-center rounded-lg border border-hint typo-body-xs-semibold text-main"
              >
                {checkNickname.isPending ? '확인중' : '중복 확인'}
              </button>
            </div>
          </div>
          <p
            className={`min-h-4 typo-body-xxs-regular ${
              status === 'available' ? 'text-link' : 'text-error'
            }`}
          >
            {statusMessage}
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-2 typo-body-xs-regular text-faint">
          <p>한글 · 영문 · 숫자</p>
          <p>2 ~ 15자</p>
          <p>특수문자 불가</p>
          <p>공백 불가</p>
        </div>
      </div>

      <InfoNotice>닉네임은 이후 마이페이지에서 변경할 수 있어요.</InfoNotice>

      {submitError ? (
        <p className="mt-3 shrink-0 text-center typo-body-xs-semibold text-error">{submitError}</p>
      ) : null}

      <PrimaryButton
        disabled={!canSubmit}
        onClick={() => onSubmit(nickname)}
        className="mt-5 shrink-0"
      >
        {isSubmitting ? '가입 중' : '완료'}
      </PrimaryButton>
    </main>
  );
}

function DoneScreen({ onNext }: { onNext: () => void }) {
  return (
    <main className="flex h-full flex-1 flex-col bg-page px-5 pb-10">
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2.5 text-center">
        <div className="flex size-19 items-center justify-center rounded-full bg-box">
          <div className="flex size-12 items-center justify-center rounded-full bg-main">
            <Check className="size-6 text-white" strokeWidth={2.6} />
          </div>
        </div>
        <h2 className="typo-body-xl-bold text-main">가입이 완료되었어요</h2>
      </section>

      <InfoNotice>전시 등록과 작품 등록은 대학생 인증 후 이용할 수 있어요.</InfoNotice>

      <PrimaryButton onClick={onNext} className="mt-5 shrink-0">
        이용하기
      </PrimaryButton>
    </main>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('terms');
  const [selectedAgreementKey, setSelectedAgreementKey] = useState<AgreementKey>('service');
  const [error, setError] = useState('');
  const [terms, setTerms] = useState<TermState>({
    over14: false,
    service: false,
    privacy: false,
    location: false,
  });
  const navigate = useNavigate();
  const agreementsQuery = useAgreements();
  const signup = useSignup();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const findAgreement = (key: AgreementKey): AgreementDto | undefined =>
    agreementsQuery.data?.find((agreement) => agreement.code === AGREEMENT_CODES[key]);

  const completeSignup = async (nickname: string) => {
    setError('');

    if (!terms.over14 || !terms.service || !terms.privacy) {
      setError('필수 약관에 모두 동의해주세요.');
      return;
    }

    if (agreementsQuery.isLoading) {
      setError('약관 정보를 불러오는 중이에요. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (agreementsQuery.isError) {
      setError('약관 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    const agreedTerms = (['service', 'privacy', 'location'] as const)
      .filter((key) => terms[key])
      .map((key) => findAgreement(key))
      .filter((agreement): agreement is AgreementDto => Boolean(agreement))
      .map((agreement) => ({ code: agreement.code, version: agreement.version }));

    try {
      const result = await signup.mutateAsync({
        nickname,
        agreements: agreedTerms,
        isOver14: terms.over14,
      });

      setAccessToken(result.accessToken);
      setStep('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '가입 완료에 실패했어요.');
    }
  };

  return (
    <MobileShell>
      {step === 'terms' ? (
        <TermsScreen
          terms={terms}
          onChange={setTerms}
          onBack={() => navigate('/login')}
          onOpenDetail={(key) => {
            setSelectedAgreementKey(key);
            setStep('termsDetail');
          }}
          onNext={() => setStep('nickname')}
        />
      ) : null}
      {step === 'termsDetail' ? (
        <TermsDetailScreen
          agreement={findAgreement(selectedAgreementKey)}
          onBack={() => setStep('terms')}
        />
      ) : null}
      {step === 'nickname' ? (
        <NicknameScreen
          isSubmitting={signup.isPending}
          onBack={() => setStep('terms')}
          submitError={error}
          onSubmit={(nickname) => {
            void completeSignup(nickname);
          }}
        />
      ) : null}
      {step === 'done' ? <DoneScreen onNext={() => navigate('/home', { replace: true })} /> : null}
    </MobileShell>
  );
}
