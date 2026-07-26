import { useState } from 'react';

import { Check, ChevronRight, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSignup } from '@/hooks/queries/useAuth';
import { useCheckNickname } from '@/hooks/queries/useUserProfile';

type Screen = 'terms' | 'nickname' | 'complete';
type NicknameCheckStatus = 'idle' | 'available' | 'unavailable' | 'error';

type TermsState = {
  all: boolean;
  service: boolean;
  privacy: boolean;
  marketing: boolean;
};

function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M12.5 15.8333L6.66667 10L12.5 4.16667"
        stroke="#3D3D3D"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8333 10H4.16667"
        stroke="#3D3D3D"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="relative flex h-14 w-full shrink-0 items-center border-b border-[#e8eaed] px-5">
      {onBack ? (
        <button type="button" onClick={onBack} className="absolute left-[14px] -ml-1.5 p-1.5">
          <ArrowLeft />
        </button>
      ) : null}
      <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold leading-6 tracking-[-0.32px] text-[#0d0d0d]">
        {title}
      </span>
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[54px] w-full items-center justify-center rounded-xl text-[15px] font-semibold tracking-[-0.15px] text-white transition-opacity disabled:cursor-not-allowed"
      style={{ background: disabled ? '#d1d5db' : '#0d0d0d' }}
    >
      {label}
    </button>
  );
}

function RoundCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full transition-colors"
      style={{
        background: checked ? '#0d0d0d' : 'transparent',
        border: checked ? 'none' : '1.5px solid #d1d5db',
      }}
    >
      {checked ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}

function Badge({ type }: { type: '필수' | '선택' }) {
  const required = type === '필수';

  return (
    <div
      className="flex h-[21px] items-center rounded px-[7px]"
      style={{
        background: required ? '#efefef' : '#f5f5f5',
        border: required ? '1px solid #d0d0d0' : '1px solid #e8eaed',
      }}
    >
      <span
        className="text-[10px] font-bold tracking-[0.3px]"
        style={{ color: required ? '#0d0d0d' : '#a0a5af' }}
      >
        {type}
      </span>
    </div>
  );
}

function TermsScreen({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (terms: TermsState) => void;
}) {
  const [terms, setTerms] = useState<TermsState>({
    all: false,
    service: false,
    privacy: false,
    marketing: false,
  });

  const toggle = (key: keyof TermsState) => {
    if (key === 'all') {
      const next = !terms.all;
      setTerms({ all: next, service: next, privacy: next, marketing: next });
      return;
    }

    const next = { ...terms, [key]: !terms[key] };
    next.all = next.service && next.privacy && next.marketing;
    setTerms(next);
  };

  const canProceed = terms.service && terms.privacy;

  return (
    <div className="flex h-full flex-col bg-white">
      <AppBar title="약관 동의" onBack={onBack} />

      <div className="flex flex-1 flex-col overflow-auto px-6 py-8">
        <div className="mb-8">
          <div className="text-[22px] font-bold leading-[29.7px] tracking-[-0.66px] text-[#0d0d0d]">
            <p>서비스 이용을 위해</p>
            <p>동의가 필요해요</p>
          </div>
          <p className="mt-2.5 text-[13px] font-normal leading-[21.45px] text-[#6b7280]">
            필수 약관에 동의한 뒤 다음 단계로 진행할 수 있어요.
          </p>
        </div>

        <div className="mb-3.5 overflow-hidden rounded-2xl border border-[#e8eaed]">
          <button
            type="button"
            onClick={() => toggle('all')}
            className="flex w-full items-center gap-3 border-b border-[#e8eaed] bg-[#f2f3f5] px-[18px] py-4 text-left"
          >
            <RoundCheckbox checked={terms.all} onChange={() => toggle('all')} />
            <div>
              <p className="text-[15px] font-bold leading-[22.5px] text-[#0d0d0d]">전체 동의</p>
              <p className="text-[12px] font-normal leading-[18px] text-[#6b7280]">
                아래 약관에 모두 동의합니다.
              </p>
            </div>
          </button>

          {[
            ['service', '필수', '서비스 이용약관 동의'],
            ['privacy', '필수', '개인정보 처리방침 동의'],
            ['marketing', '선택', '마케팅 정보 수신 동의'],
          ].map(([key, type, label], index) => (
            <div key={key} className={index < 2 ? 'border-b border-[#e8eaed]' : ''}>
              <div className="flex items-center gap-3 px-[18px] py-[14px]">
                <RoundCheckbox
                  checked={terms[key as keyof TermsState]}
                  onChange={() => toggle(key as keyof TermsState)}
                />
                <Badge type={type as '필수' | '선택'} />
                <span className="min-w-0 flex-1 text-[13px] font-normal leading-[19.5px] text-[#3d3d3d]">
                  {label}
                </span>
                <ChevronRight size={16} color="#A0A5AF" strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <PrimaryButton
          label="동의하고 계속하기"
          onClick={() => onNext(terms)}
          disabled={!canProceed}
        />
      </div>
    </div>
  );
}

function NicknameScreen({
  onBack,
  onNext,
  isSubmitting,
}: {
  onBack: () => void;
  onNext: (nickname: string) => void;
  isSubmitting: boolean;
}) {
  const [nickname, setNickname] = useState('displayu디유');
  const [checkStatus, setCheckStatus] = useState<NicknameCheckStatus>('idle');
  const maxLen = 15;
  const { refetch: checkNickname, isFetching: isCheckingNickname } = useCheckNickname(
    { nickname },
    false,
  );

  const handleChange = (value: string) => {
    setNickname(value.slice(0, maxLen));
    setCheckStatus('idle');
  };

  const handleCheck = async () => {
    if (nickname.length < 5 || isCheckingNickname) {
      return;
    }

    try {
      const result = await checkNickname();
      const isAvailable = result.data?.isAvailable;
      setCheckStatus(
        typeof isAvailable === 'boolean' ? (isAvailable ? 'available' : 'unavailable') : 'error',
      );
    } catch {
      setCheckStatus('error');
    }
  };

  const isValid = checkStatus === 'available' && nickname.length >= 5;

  return (
    <div className="flex h-full flex-col bg-white">
      <AppBar title="닉네임 설정" onBack={onBack} />

      <div className="flex flex-1 flex-col overflow-auto px-6 py-8">
        <div className="mb-9">
          <div className="text-[22px] font-bold leading-[29.7px] tracking-[-0.66px] text-[#0d0d0d]">
            <p>디유에서 사용할</p>
            <p>닉네임을 정해주세요</p>
          </div>
          <p className="mt-2.5 text-[13px] font-normal leading-[21.45px] text-[#6b7280]">
            방명록, 게시판, 프로필에서 표시되는 이름이에요.
          </p>
        </div>

        <p className="mb-2 text-[12px] font-semibold leading-[18px] tracking-[0.36px] text-[#6b7280]">
          닉네임
        </p>

        <div className="flex h-[52px] w-full items-center gap-2.5 rounded-xl border-[1.5px] border-[#0d0d0d] bg-white px-[15.5px]">
          <input
            className="min-w-0 flex-1 bg-transparent text-[15px] font-normal tracking-[-0.15px] text-[#0d0d0d] outline-none"
            value={nickname}
            onChange={(event) => handleChange(event.target.value)}
          />
          {nickname ? (
            <button
              type="button"
              onClick={() => {
                setNickname('');
                setCheckStatus('idle');
              }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[10px] bg-[#d1d5db]"
            >
              <X size={11} color="white" strokeWidth={1.5} />
            </button>
          ) : null}
          <div className="h-[18px] w-px shrink-0 bg-[#e8eaed]" />
          <button
            type="button"
            onClick={handleCheck}
            disabled={nickname.length < 5 || isCheckingNickname}
            className="flex h-8 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-[#0d0d0d] bg-white px-3 disabled:opacity-40"
          >
            <span className="text-[12px] font-semibold text-[#0d0d0d]">
              {isCheckingNickname ? '확인 중' : '중복 확인'}
            </span>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {checkStatus === 'available' ? (
            <div className="flex items-center gap-1">
              <Check size={14} color="#16a34a" strokeWidth={1.5} />
              <span className="text-[12px] font-medium text-[#16a34a]">
                사용 가능한 닉네임이에요.
              </span>
            </div>
          ) : checkStatus === 'unavailable' ? (
            <span className="text-[12px] font-normal text-[#ef4444]">
              이미 사용 중인 닉네임이에요.
            </span>
          ) : checkStatus === 'error' ? (
            <span className="text-[12px] font-normal text-[#ef4444]">
              중복 확인에 실패했어요. 다시 시도해주세요.
            </span>
          ) : (
            <span className="text-[12px] font-normal text-[#a0a5af]">중복 확인을 해주세요.</span>
          )}
          <span className="text-[11px] font-normal text-[#a0a5af]">
            {nickname.length} / {maxLen}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {['한글 · 영문 · 숫자', '5 ~ 15자', '특수문자 불가', '공백 불가'].map((rule) => (
            <div
              key={rule}
              className="flex h-[26.5px] items-center rounded-full border border-[#e8eaed] bg-[#f2f3f5] px-2.5"
            >
              <span className="text-[11px] font-normal text-[#6b7280]">{rule}</span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[12px] font-normal text-[#a0a5af]">
          닉네임은 이후 마이페이지에서 변경할 수 있어요.
        </p>

        <div className="flex-1" />

        <PrimaryButton
          label={isSubmitting ? '가입 중' : '가입 완료하기'}
          onClick={() => onNext(nickname)}
          disabled={!isValid || isSubmitting}
        />
      </div>
    </div>
  );
}

function CompleteScreen({
  onContinue,
  onLogout,
  onWithdraw,
}: {
  onContinue: () => void;
  onLogout: () => void;
  onWithdraw: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-6 pb-10 pt-14">
      <div className="mb-8 flex h-[76px] w-[76px] items-center justify-center rounded-[38px] border border-[#e8eaed] bg-[#f2f3f5]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d0d0d]">
          <Check size={24} color="white" strokeWidth={2.8} />
        </div>
      </div>

      <h2 className="mb-4 text-[24px] font-extrabold leading-[31.2px] tracking-[-0.96px] text-[#0d0d0d]">
        가입이 완료되었어요
      </h2>

      <p className="mb-2.5 text-center text-[14px] font-normal leading-[24.5px] tracking-[-0.14px] text-[#6b7280]">
        이제 댓글, 저장, 기록 기능을
        <br />
        이용할 수 있어요.
      </p>

      <div className="mb-8 mt-0 w-full max-w-[327px]">
        <div className="h-px w-full bg-[#e8eaed]" />
      </div>

      <div className="mb-5 flex w-full max-w-[327px] flex-col gap-2.5">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-[54px] w-full items-center justify-center rounded-xl bg-[#0d0d0d]"
        >
          <span className="text-[15px] font-bold tracking-[-0.3px] text-white">
            이어서 이용하기
          </span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-[54px] w-full items-center justify-center rounded-xl border-[1.5px] border-[#d1d5db] bg-white"
        >
          <span className="text-[15px] font-medium tracking-[-0.3px] text-[#3a3a3a]">로그아웃</span>
        </button>
        <button
          type="button"
          onClick={onWithdraw}
          className="flex h-[54px] w-full items-center justify-center rounded-xl border-[1.5px] border-[#d1d5db] bg-white"
        >
          <span className="text-[15px] font-medium tracking-[-0.3px] text-[#3a3a3a]">탈퇴하기</span>
        </button>
      </div>

      <div className="flex w-full max-w-[327px] items-start gap-1.5 rounded-lg border border-[#e8eaed] bg-[#fafafa] px-[15px] py-[13px]">
        <div className="mt-px shrink-0">
          <Info size={13} color="#A0A5AF" strokeWidth={1.2} />
        </div>
        <p className="text-[11px] font-normal leading-[18.15px] tracking-[-0.11px] text-[#a0a5af]">
          전시 등록과 작품 등록은 대학생 인증 후 이용할 수 있어요.
        </p>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const [screen, setScreen] = useState<Screen>('terms');
  const [authError, setAuthError] = useState('');
  const [agreedTerms, setAgreedTerms] = useState<TermsState>({
    all: false,
    service: true,
    privacy: true,
    marketing: false,
  });
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const completeSignup = async (nickname: string) => {
    setAuthError('');

    try {
      const result = await signupMutation.mutateAsync({
        nickname,
        agreements: [
          { agreeId: 1, isAgreed: true },
          { agreeId: 2, isAgreed: true },
          { agreeId: 3, isAgreed: agreedTerms.marketing },
        ],
      });

      localStorage.setItem('accessToken', result.accessToken);
      setScreen('complete');
    } catch {
      setAuthError('가입 완료에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-[#f0f0f0] font-[Pretendard,sans-serif]">
      <div className="relative h-dvh w-full max-w-[375px] overflow-hidden bg-white">
        {screen === 'terms' ? (
          <TermsScreen
            onBack={() => navigate('/login')}
            onNext={(terms) => {
              setAgreedTerms(terms);
              setScreen('nickname');
            }}
          />
        ) : null}
        {screen === 'nickname' ? (
          <NicknameScreen
            onBack={() => setScreen('terms')}
            onNext={completeSignup}
            isSubmitting={signupMutation.isPending}
          />
        ) : null}
        {screen === 'complete' ? (
          <CompleteScreen
            onContinue={() => navigate('/home')}
            onLogout={() => navigate('/login')}
            onWithdraw={() => navigate('/login')}
          />
        ) : null}
        {authError ? (
          <div className="absolute bottom-5 left-6 right-6 rounded-lg bg-[#fee2e2] px-4 py-3 text-center text-[12px] font-medium text-[#b91c1c]">
            {authError}
          </div>
        ) : null}
      </div>
    </div>
  );
}
