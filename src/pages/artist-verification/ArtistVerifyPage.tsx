import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useNavigate } from 'react-router-dom';

import {
  ActivityFieldSelector,
  ArtistVerifyBottomBar,
  ArtistVerifyBottomButton,
  ArtistVerifyComplete,
  ArtistVerifyField,
  ArtistVerifyHeader,
  ArtistVerifyHelperText,
  ArtistVerifyInput,
  ArtistVerifyLeaveOverlay,
  SchoolEmailField,
  SchoolSearchField,
  VerificationCodeField,
} from '@/components/artist-verify';
import { PageContainer } from '@/components/layout';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useFlowBack } from '@/hooks/useFlowBack';

import { useArtistVerifyFlow } from './useArtistVerifyFlow';

const FORM_ID = 'artist-verify-form';

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
    <PageContainer className="bg-primary-white" variant="form">
      <ArtistVerifyHeader onBack={handleBack} title="작가 인증" />

      <form
        className="flex-1 pt-3 pb-6"
        id={FORM_ID}
        noValidate
        onSubmit={(event) => void flow.submit(event)}
      >
        <fieldset className="flex flex-col gap-5" disabled={flow.isSaving}>
          <h2 className="typography-title-xs text-primary">작가 인증 정보를 입력해주세요</h2>

          <fieldset className="contents" disabled={flow.isVerifying}>
            <SchoolSearchField
              isLoading={flow.isSchoolLoading}
              locked={flow.isCodeConfirmed}
              onChange={flow.setSchool}
              onSelect={handleSelectSchool}
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
              <ArtistVerifyField htmlFor="artist-name" label="작가 프로필명">
                <ArtistVerifyInput
                  aria-describedby={flow.artistNameError ? 'artist-name-error' : undefined}
                  id="artist-name"
                  invalid={Boolean(flow.artistNameError)}
                  placeholder="작가 프로필명"
                  {...flow.registerArtistName}
                />
                {flow.artistNameError ? (
                  <ArtistVerifyHelperText error id="artist-name-error">
                    {flow.artistNameError}
                  </ArtistVerifyHelperText>
                ) : null}
              </ArtistVerifyField>

              <ActivityFieldSelector
                onChange={flow.changeFields}
                onMaxSelectExceeded={flow.notifyMaxFieldsExceeded}
                selected={flow.selectedFields}
              />
            </>
          ) : null}
        </fieldset>
      </form>

      <ArtistVerifyBottomBar>
        <ArtistVerifyBottomButton
          disabled={!flow.canSubmit || flow.isSaving}
          form={FORM_ID}
          type="submit"
        >
          {flow.isSaving ? '저장 중' : '인증 완료'}
        </ArtistVerifyBottomButton>
      </ArtistVerifyBottomBar>

      <ArtistVerifyLeaveOverlay
        onLeave={leave}
        onStay={() => setIsLeaveOverlayOpen(false)}
        open={isLeaveOverlayOpen}
      />
    </PageContainer>
  );
}
