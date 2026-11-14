import type { ComponentProps, ReactNode } from 'react';

import type { LinkParseResult } from '@/utils/linkInput';

import { VerifyHelperText } from './VerifyField';
import { VerifyInput } from './VerifyInput';

/* 프로토타입(profile-edit.html) .field 와 같은 위 간격 · 나타나는 움직임 */
export const PROFILE_FIELD_CLASS =
  'mt-6 animate-[artist-verify-rise_.45s_cubic-bezier(.16,1,.3,1)_backwards]';

/** 선택 입력칸 이름. "· 선택"이 이름 옆에 붙는다 */
export function ProfileOptionalLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center text-[14px] font-semibold" htmlFor={htmlFor}>
      <span>
        {children}
        <span className="ml-1.5 text-[12px] font-medium text-[#71717b]">· 선택</span>
      </span>
    </label>
  );
}

type ProfileLinkFieldProps = Omit<ComponentProps<typeof VerifyInput>, 'id' | 'invalid'> & {
  id: string;
  label: string;
  parsed: LinkParseResult;
  idleHelp: string;
  validHelp: string;
  errorMessage: string;
};

/** Instagram · Portfolio 입력칸. 입력값에 따라 안내 문구가 바뀐다 */
export function ProfileLinkField({
  id,
  label,
  parsed,
  idleHelp,
  validHelp,
  errorMessage,
  ...inputProps
}: ProfileLinkFieldProps) {
  const helpId = `${id}-help`;
  const isInvalid = parsed.status === 'invalid';

  return (
    <div className={PROFILE_FIELD_CLASS}>
      <ProfileOptionalLabel htmlFor={id}>{label}</ProfileOptionalLabel>
      <VerifyInput
        aria-describedby={helpId}
        autoCapitalize="none"
        autoComplete="off"
        id={id}
        invalid={isInvalid}
        spellCheck={false}
        type="text"
        wrapperClassName="mt-2"
        {...inputProps}
      />
      <VerifyHelperText error={isInvalid} id={helpId}>
        {isInvalid ? errorMessage : parsed.status === 'valid' ? validHelp : idleHelp}
      </VerifyHelperText>
    </div>
  );
}
