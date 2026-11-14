import { type InputHTMLAttributes, useId } from 'react';

import { cn } from '@/utils/cn';
import type { LinkParseResult } from '@/utils/linkInput';

import { FIELD_CLASS, HELP_CLASS, INPUT_CLASS, LABEL_CLASS } from './displayRegister.styles';

interface DisplayLinkFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  parsed: LinkParseResult;
  idleHelp: string;
  validHelp: string;
  errorMessage: string;
  /** disabled 일 때 보여줄 안내 */
  lockedHelp?: string;
}

/** 프로토타입 전시 링크(인스타그램 · 웹사이트) 칸. 형식이 틀리면 밑줄과 안내가 빨갛게 바뀐다 */
export function DisplayLinkField({
  label,
  parsed,
  idleHelp,
  validHelp,
  errorMessage,
  lockedHelp,
  ...inputProps
}: DisplayLinkFieldProps) {
  const inputId = useId();
  const helpId = useId();
  const isLocked = Boolean(inputProps.disabled);
  const isInvalid = !isLocked && parsed.status === 'invalid';
  const help = isLocked
    ? (lockedHelp ?? idleHelp)
    : parsed.status === 'valid'
      ? validHelp
      : isInvalid
        ? errorMessage
        : idleHelp;

  return (
    <div className={FIELD_CLASS}>
      <label htmlFor={inputId} className={cn(LABEL_CLASS, 'justify-start')}>
        <span>
          {label}
          <span className="typography-body-md-medium ml-1.5 text-tertiary">· 선택</span>
        </span>
      </label>
      <div
        className={cn(
          'relative mt-1 flex h-[47px] items-center border-b transition-colors duration-fast ease-standard',
          isInvalid ? 'border-error' : 'border-primary focus-within:border-[#18181b]',
        )}
      >
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={isInvalid}
          aria-describedby={helpId}
          className={cn(INPUT_CLASS, 'disabled:text-secondary')}
          {...inputProps}
        />
      </div>
      <p id={helpId} aria-live="polite" className={cn(HELP_CLASS, isInvalid && 'text-error')}>
        {help}
      </p>
    </div>
  );
}
