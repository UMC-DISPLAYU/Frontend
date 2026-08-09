import { useState } from 'react';

import { Check, ChevronLeft, Info, X } from 'lucide-react';
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
type PolicyCode = 'terms' | 'privacy' | 'location';
type TermState = Record<TermKey, boolean>;
type NicknameStatus = 'idle' | 'available' | 'unavailable' | 'error';
type ParsedPolicyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string };

const AGREEMENT_CODES: Record<Exclude<TermKey, 'over14'>, string> = {
  service: 'TERMS_OF_SERVICE',
  privacy: 'PRIVACY_COLLECTION_USE',
  location: 'LOCATION_BASED_SERVICE',
};

const POLICY_TERM_KEYS: Record<PolicyCode, Exclude<TermKey, 'over14'>> = {
  terms: 'service',
  privacy: 'privacy',
  location: 'location',
};

function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0]">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로가기"
      className="flex size-8 shrink-0 items-center justify-center"
    >
      <ChevronLeft className="size-[22px] text-[#0d0d0d]" strokeWidth={2} />
    </button>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0d0d0d] text-[14px] font-semibold leading-5 text-white disabled:bg-[#d8dbe1] disabled:text-white"
    >
      {children}
    </button>
  );
}

function AgreementCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
        checked ? 'border-[#0d0d0d] bg-[#0d0d0d]' : 'border-[#d8dbe1] bg-white'
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
  onOpenDetail: (code: PolicyCode) => void;
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
    <main className="flex flex-1 flex-col px-5 pb-10 pt-[58px]">
      <BackButton onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-10">
        <h2 className="text-[24px] font-bold leading-8 text-[#0d0d0d]">
          서비스 이용을 위해
          <br />
          동의가 필요해요
        </h2>

        <section className="mt-9">
          <button
            type="button"
            onClick={() => toggle('all')}
            className="flex h-[58px] w-full items-center border-b border-[#c4c4c4] text-left"
          >
            <span className="min-w-0 flex-1 text-[18px] font-bold leading-[25.2px] tracking-[-0.54px] text-[#111]">
              전체 동의
            </span>
            <AgreementCheck checked={allChecked} />
          </button>

          <div className="mt-5 flex flex-col gap-5">
            <div className="flex min-h-9 items-center gap-3">
              <div className="min-w-0 flex-1 text-[16px] leading-[22.4px] tracking-[-0.48px]">
                <button
                  type="button"
                  onClick={() => onOpenDetail('terms')}
                  className="font-medium text-[#555] underline underline-offset-[3px]"
                >
                  이용약관
                </button>
                <span className="text-[#767676]"> 및 </span>
                <button
                  type="button"
                  onClick={() => onOpenDetail('privacy')}
                  className="font-medium text-[#555] underline underline-offset-[3px]"
                >
                  개인정보취급방침
                </button>
                <span className="ml-2 text-[14px] leading-[19.6px] tracking-[-0.42px] text-[#9ca3af]">
                  (필수)
                </span>
              </div>
              <CheckButton
                checked={termsAndPrivacyChecked}
                onClick={() => toggle('termsAndPrivacy')}
              />
            </div>

            <div className="flex min-h-9 items-center gap-3">
              <span className="min-w-0 flex-1 text-[16px] font-normal leading-[22.4px] tracking-[-0.48px] text-[#767676]">
                만 14세 이상 확인
                <span className="ml-1 text-[14px] leading-[19.6px] tracking-[-0.42px] text-[#9ca3af]">
                  (필수)
                </span>
              </span>
              <CheckButton checked={terms.over14} onClick={() => toggle('over14')} />
            </div>

            <div className="flex min-h-9 items-center gap-3">
              <div className="min-w-0 flex-1 text-[16px] leading-[22.4px] tracking-[-0.48px]">
                <button
                  type="button"
                  onClick={() => onOpenDetail('location')}
                  className="font-medium text-[#555] underline underline-offset-[3px]"
                >
                  위치기반서비스 이용약관
                </button>
                <span className="ml-2 text-[14px] leading-[19.6px] tracking-[-0.42px] text-[#9ca3af]">
                  (선택)
                </span>
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
            <h2
              key={key}
              className="pt-8 text-[17px] font-semibold leading-[25.5px] text-[#111827] first:pt-0"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={key} className="flex items-start gap-[10px] pt-[6px]">
              <span className="mt-[9px] size-[6px] shrink-0 rounded-full bg-[#d1d5db]" />
              <p className="min-w-0 flex-1 whitespace-pre-wrap text-[15px] leading-[24.75px] text-[#374151]">
                {block.text}
              </p>
            </div>
          );
        }

        return (
          <p
            key={key}
            className="whitespace-pre-wrap pt-3 text-[15px] leading-[24.75px] text-[#374151] first:pt-0"
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
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#e5e7eb] bg-white px-4 pb-px">
        <div className="h-9 w-[30px]">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="-ml-1 flex size-9 items-center justify-center"
          >
            <ChevronLeft className="size-5 text-[#111827]" strokeWidth={2} />
          </button>
        </div>
        <h1 className="text-[16px] font-semibold leading-6 text-[#111827]">{title}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-8 pt-5">
        {!agreement ? (
          <div className="py-10 text-center text-[14px] text-[#8a94a6]">
            약관 정보를 불러오는 중이거나 문제가 발생했습니다.
          </div>
        ) : (
          <>
            <p className="text-[11.5px] leading-[17.25px] text-[#8a94a6]">
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
  const isNicknameShapeValid = /^[가-힣a-zA-Z0-9]{5,15}$/.test(nickname);
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
    <main className="flex h-full flex-1 flex-col bg-white px-5 pb-10 pt-[58px]">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="flex size-8 shrink-0 items-center justify-center"
      >
        <ChevronLeft className="size-[22px] text-[#0d0d0d]" strokeWidth={2} />
      </button>

      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-10">
        <h2 className="text-[24px] font-bold leading-[33.6px] tracking-[-0.72px] text-[#0d0d0d]">
          디유에서 사용할
          <br />
          닉네임을 정해주세요
        </h2>
        <p className="mt-3 text-[14px] font-semibold leading-[19.6px] tracking-[-0.42px] text-[#656b75]">
          방명록, 게시판, 프로필에서 표시되는 이름이에요.
        </p>

        <section className="mt-9 flex w-full flex-col gap-3">
          <label
            className="text-[14px] font-bold leading-[19.6px] tracking-[-0.42px] text-[#111]"
            htmlFor="nickname"
          >
            닉네임
          </label>
          <div className="flex w-full items-center border-b border-[#c4c4c4]">
            <div className="flex h-[38px] min-w-0 flex-1 items-center px-3 py-[10px]">
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
                className="min-w-0 flex-1 bg-transparent text-[12px] leading-[18px] tracking-[-0.36px] text-[#111] outline-none placeholder:text-[#9d9d9d]"
              />
            </div>
            <div className="flex h-[38px] shrink-0 items-center gap-[10px]">
              {nickname ? (
                <button
                  type="button"
                  onClick={() => {
                    setNickname('');
                    setCheckedNickname('');
                    setStatus('idle');
                  }}
                  aria-label="닉네임 지우기"
                  className="flex size-5 items-center justify-center rounded-[10px] bg-[#d7d7df]"
                >
                  <X className="size-[11px] text-white" strokeWidth={2.5} />
                </button>
              ) : null}
              <div className="h-[18px] w-px bg-[#d7d7df]" />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!isNicknameShapeValid || checkNickname.isPending}
                className="flex h-8 w-[71.336px] items-center justify-center rounded-lg border border-[#767676] text-[12px] font-semibold leading-[18px] tracking-[-0.36px] text-[#111] disabled:border-[#d7d7df] disabled:text-[#9d9d9d]"
              >
                {checkNickname.isPending ? '확인중' : '중복 확인'}
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-2 text-[12px] leading-[16.8px] tracking-[-0.36px] text-[#9d9d9d]">
          <p>한글 · 영문 · 숫자</p>
          <p>5 ~ 15자</p>
          <p>특수문자 불가</p>
          <p>공백 불가</p>
        </div>
        <p
          className={`mt-3 min-h-[17px] text-[12px] leading-[16.8px] tracking-[-0.36px] ${
            status === 'available' ? 'text-[#22a06b]' : 'text-[#ef4444]'
          }`}
        >
          {statusMessage}
        </p>
      </div>

      <div className="shrink-0 rounded-[14px] bg-[#f9f9f9] p-[14px]">
        <div className="flex items-start gap-2">
          <Info className="mt-[1px] size-4 shrink-0 text-[#9d9d9d]" strokeWidth={1.8} />
          <p className="min-w-0 flex-1 text-[12px] leading-[16.8px] tracking-[-0.36px] text-[#9d9d9d]">
            닉네임은 이후 마이페이지에서 변경할 수 있어요.
          </p>
        </div>
      </div>

      {submitError ? (
        <p className="mt-3 shrink-0 text-center text-[12px] font-medium leading-[16.8px] tracking-[-0.36px] text-[#ef4444]">
          {submitError}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit(nickname)}
        className="mt-5 flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#111] text-[14px] font-semibold leading-5 tracking-[-0.42px] text-white disabled:bg-[#d7d7df]"
      >
        {isSubmitting ? '가입 중' : '가입 완료하기'}
      </button>
    </main>
  );
}

function DoneScreen({ onNext }: { onNext: () => void }) {
  return (
    <main className="flex h-full flex-1 flex-col bg-[#f0f0f3] px-5 pb-10">
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[10px] text-center">
        <div className="flex size-[76px] items-center justify-center rounded-full bg-[#e6e6ee]">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#111]">
            <Check className="size-6 text-white" strokeWidth={2.6} />
          </div>
        </div>
        <h2 className="text-[20px] font-bold leading-7 tracking-[-0.6px] text-[#111]">
          가입이 완료되었어요
        </h2>
      </section>

      <div className="shrink-0 rounded-[14px] bg-[#f9f9f9] p-[14px]">
        <div className="flex items-start gap-2">
          <Info className="mt-[1px] size-4 shrink-0 text-[#9d9d9d]" strokeWidth={1.8} />
          <p className="min-w-0 flex-1 text-[12px] leading-[16.8px] tracking-[-0.36px] text-[#9d9d9d]">
            전시 등록과 작품 등록은 대학생 인증 후 이용할 수 있어요.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-5 flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-[#111] text-[14px] font-semibold leading-5 text-white"
      >
        이용하기
      </button>
    </main>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('terms');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyCode>('terms');
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

  const findAgreement = (key: Exclude<TermKey, 'over14'>): AgreementDto | undefined =>
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

    const requiredAgreementCodes = (['service', 'privacy'] as const).map(
      (key) => AGREEMENT_CODES[key],
    );
    const hasRequiredAgreements = requiredAgreementCodes.every((code) =>
      agreedTerms.some((agreement) => agreement.code === code),
    );

    if (!hasRequiredAgreements) {
      setError('필수 약관 동의 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

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
          onOpenDetail={(code) => {
            setSelectedPolicy(code);
            setStep('termsDetail');
          }}
          onNext={() => setStep('nickname')}
        />
      ) : null}
      {step === 'termsDetail' ? (
        <TermsDetailScreen
          agreement={findAgreement(POLICY_TERM_KEYS[selectedPolicy])}
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
      {step === 'done' ? <DoneScreen onNext={() => navigate('/home')} /> : null}
    </MobileShell>
  );
}
