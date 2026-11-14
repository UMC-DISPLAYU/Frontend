import type { Ref } from 'react';

import { VerifyActionButton } from './VerifyActionButton';
import { VerifyField, VerifyHelperText } from './VerifyField';
import { VerifyInput } from './VerifyInput';

type SchoolEmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  canSend: boolean;
  sent: boolean;
  verified: boolean;
  error?: string;
  isSending?: boolean;
  /** 학교를 목록에서 고르기 전에는 칸은 보이되 입력할 수 없다 */
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
};

const HELPER_ID = 'school-email-helper';

export function SchoolEmailField({
  value,
  onChange,
  onSend,
  canSend,
  sent,
  verified,
  error,
  isSending = false,
  disabled = false,
  inputRef,
}: SchoolEmailFieldProps) {
  const helper =
    error ?? (verified ? '학교 이메일 인증이 완료됐어요' : sent ? '인증 메일을 발송했어요' : null);

  return (
    <VerifyField htmlFor="school-email" label="학교 이메일">
      <div className="mt-1 flex items-center gap-2">
        <VerifyInput
          aria-describedby={helper ? HELPER_ID : undefined}
          autoCapitalize="off"
          autoComplete="email"
          disabled={disabled}
          id="school-email"
          inputMode="email"
          invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="school@univ.ac.kr"
          readOnly={verified}
          ref={inputRef}
          type="email"
          value={value}
        />
        {verified ? null : (
          <VerifyActionButton disabled={!canSend || isSending} onClick={onSend}>
            {sent ? '재발송' : '메일발송'}
          </VerifyActionButton>
        )}
      </div>
      {helper ? (
        <VerifyHelperText error={Boolean(error)} id={HELPER_ID}>
          {helper}
        </VerifyHelperText>
      ) : null}
    </VerifyField>
  );
}
