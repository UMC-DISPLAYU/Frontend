import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useNavigate } from 'react-router-dom';

import {
  ArtistVerifyComplete,
  ArtistVerifyLayout,
  ArtistVerifyLeaveOverlay,
  SchoolEmailField,
  SchoolSearchField,
  VerificationCodeField,
  VerifyBottomBar,
  VerifyBottomButton,
  VerifyField,
  VerifyFieldChips,
  VerifyHeader,
  VerifyHelperText,
  VerifyInput,
} from '@/components/artist-verify';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';

import { useArtistVerifyFlow } from './useArtistVerifyFlow';

export function ArtistVerifyPage() {
  const navigate = useNavigate();
  const flowBack = useFlowBack();
  const flow = useArtistVerifyFlow();
  const { data: me } = useUserMe();
  const [isLeaveOverlayOpen, setIsLeaveOverlayOpen] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  if (flow.isComplete) {
    return (
      <ArtistVerifyComplete
        onDone={flowBack}
        onGoProfile={() => navigate(me ? `/artist/${me.id}` : '/my', { replace: true })}
      />
    );
  }

  const handleSelectSchool = (school: string) => {
    // 비활성이던 이메일 칸이 풀린 뒤에 포커스해야 하므로 먼저 반영한다
    flushSync(() => flow.selectSchool(school));
    emailInputRef.current?.focus();
  };

  const handleBack = () => (flow.hasInput ? setIsLeaveOverlayOpen(true) : flowBack());

  // 확인창(Overlay)이 같은 주소로 기록을 하나 쌓으므로 그 기록까지 건너뛰어 들어오기 전 화면으로 간다.
  // 이전 기록이 없을 때의 처리는 useFlowBack 과 같다.
  const leave = () => {
    if (window.history.length > 2) {
      navigate(-2);
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <ArtistVerifyLayout>
      <main className="flex flex-1 flex-col">
        <VerifyHeader onBack={handleBack} title="작가 인증" />
        <p className="mt-2 text-[20px] leading-[1.4] font-semibold">
          작가 인증 정보를 입력해주세요
        </p>

        <form
          autoComplete="off"
          className="flex flex-1 flex-col"
          noValidate
          onSubmit={(event) => void flow.submit(event)}
        >
          <fieldset className="flex-1" disabled={flow.isSaving}>
            <fieldset className="contents" disabled={flow.isVerifying}>
              <SchoolSearchField
                isLoading={flow.isSchoolLoading}
                onChange={flow.setSchool}
                onSelect={handleSelectSchool}
                selected={flow.isSchoolSelected}
                suggestions={flow.schoolSuggestions}
                value={flow.school}
              />

              <SchoolEmailField
                canSend={flow.canSendMail}
                disabled={!flow.isSchoolSelected}
                error={flow.emailError}
                inputRef={emailInputRef}
                isSending={flow.isSendingMail}
                onChange={flow.setEmail}
                onSend={flow.sendVerificationMail}
                sent={flow.isMailSent}
                value={flow.email}
                verified={flow.isCodeConfirmed}
              />

              {flow.isMailSent && !flow.isCodeConfirmed ? (
                <VerificationCodeField
                  error={flow.codeError}
                  isConfirming={flow.isConfirmingCode}
                  key={flow.emailGeneration}
                  onChange={flow.setCode}
                  onConfirm={flow.confirmVerificationCode}
                  value={flow.code}
                />
              ) : null}
            </fieldset>

            {flow.isCodeConfirmed ? (
              <>
                <VerifyField htmlFor="artist-name" label="작가 프로필명">
                  <VerifyInput
                    aria-describedby={flow.artistNameError ? 'artist-name-error' : undefined}
                    autoComplete="off"
                    // 이메일 인증이 끝나 이 칸이 나타나면 바로 입력할 수 있게 한다(프로토타입과 같음)
                    autoFocus
                    id="artist-name"
                    invalid={Boolean(flow.artistNameError)}
                    maxLength={20}
                    placeholder="작가 프로필명"
                    wrapperClassName="mt-2"
                    {...flow.registerArtistName}
                  />
                  {flow.artistNameError ? (
                    <VerifyHelperText error id="artist-name-error">
                      {flow.artistNameError}
                    </VerifyHelperText>
                  ) : null}
                </VerifyField>

                <VerifyFieldChips
                  onChange={flow.changeFields}
                  onMaxSelectExceeded={flow.notifyMaxFieldsExceeded}
                  selected={flow.selectedFields}
                />
              </>
            ) : null}
          </fieldset>

          <VerifyBottomBar>
            <VerifyBottomButton disabled={!flow.canSubmit || flow.isSaving} type="submit">
              {flow.isSaving ? '저장 중' : '인증 완료'}
            </VerifyBottomButton>
          </VerifyBottomBar>
        </form>
      </main>

      <ArtistVerifyLeaveOverlay
        onLeave={leave}
        onStay={() => setIsLeaveOverlayOpen(false)}
        open={isLeaveOverlayOpen}
      />
    </ArtistVerifyLayout>
  );
}
