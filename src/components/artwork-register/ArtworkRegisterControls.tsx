import { Check, UserRound, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { BottomSheet, RequiredLabel } from '@/components/ui';
import { ARTWORK_REGISTER_AUTHOR_NAME_MAX_LENGTH } from '@/pages/artwork-register/artworkRegister.schema';
import { cn } from '@/utils/cn';

export interface RegisterPerson {
  id: string;
  name: string;
  account: string;
  userId?: number;
  tag?: string;
}

export interface AuthorOption extends RegisterPerson {
  verified: boolean;
  isMember?: boolean;
}

export function UnderlineTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 1500,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col border-b border-line px-3 py-2.5">
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="typo-body-xs-regular min-h-23 resize-none bg-transparent text-main outline-none placeholder:text-faint"
      />
      <span className="typo-body-xxs-regular text-right text-faint">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

export function ChoiceCard({
  title,
  description,
  helper,
  selected,
  compact = false,
  onClick,
}: {
  title: string;
  description: string;
  helper?: ReactNode;
  selected: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl bg-card px-4 py-3.5 text-left',
        selected && 'outline outline-line-active',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="typo-body-md-bold text-main">{title}</p>
          {compact ? (
            <div className="mt-2.5 flex flex-col">
              <p className="typo-body-xs-regular text-main">{description}</p>
              {helper && <div className="typo-body-xs-regular">{helper}</div>}
            </div>
          ) : (
            <>
              <p className="typo-body-xs-regular mt-2.5 text-sub700">{description}</p>
              {helper && <div className="typo-body-sm-regular mt-4">{helper}</div>}
            </>
          )}
        </div>
        {selected && <Check className="size-5 shrink-0 text-line-active" strokeWidth={2} />}
      </div>
    </button>
  );
}

export function AuthorSelectCard({
  name,
  account,
  verified,
  selected,
  onClick,
  isMember = true,
}: {
  name: string;
  account: string;
  verified: boolean;
  selected: boolean;
  onClick: () => void;
  isMember?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!verified}
      className={cn(
        'flex h-22 w-full items-center gap-3 rounded-[20px] px-3 py-5 text-left',
        verified ? 'bg-card' : 'bg-bt-gray',
        selected && 'border border-line-active',
      )}
    >
      <span
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-full bg-box100',
          !verified && 'border-[1.6px] border-line bg-line-soft',
        )}
      >
        <UserRound className={cn('size-6 text-line', !verified && 'text-card')} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-body-sm-bold truncate leading-5 text-main">{name}</p>
        <p className="typo-body-xs-regular mt-2 truncate leading-4 text-hint">
          {verified
            ? account
            : isMember
              ? '작가 인증 후 선택할 수 있어요.'
              : '직접 입력한 작가는 선택할 수 없어요.'}
        </p>
      </div>
      {verified && (
        <span className="typo-body-xs-regular shrink-0 rounded bg-blue-100 px-2.5 py-1 text-link">
          작가인증
        </span>
      )}
    </button>
  );
}

export function CollaboratorTeamCard({
  name,
  account,
  verified,
  onClick,
}: {
  name: string;
  account: string;
  verified: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!verified}
      className={cn(
        'flex h-22 w-full items-center gap-3 rounded-[20px] px-3 py-5 text-left shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        verified ? 'border border-line bg-card' : 'bg-bt-gray',
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-box100">
        <UserRound className="size-6 text-line" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-body-sm-bold truncate text-main">{name}</p>
        <p className="typo-body-xs-regular mt-2 truncate text-faint">
          {verified ? account : '작가 인증 후 선택할 수 있어요.'}
        </p>
      </div>
      {verified && (
        <span className="typo-body-xs-regular shrink-0 rounded bg-blue-100 px-2.5 py-1 text-link">
          작가인증
        </span>
      )}
    </button>
  );
}

export function PersonCard({
  name,
  account,
  tag,
  selected = false,
  removable = false,
  disabled = false,
  onClick,
  onRemove,
}: {
  name: string;
  account: string;
  tag?: string;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const content = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-box100">
        <UserRound className="size-6 text-line" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="typo-body-sm-bold truncate text-main">{name}</p>
        <p className="typo-body-xs-regular mt-2 truncate text-faint">{account}</p>
      </div>
      {tag && (
        <span className="typo-body-xs-regular shrink-0 rounded bg-blue-100 px-2.5 py-1 text-link">
          {tag}
        </span>
      )}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${name} 제거`}
          className="grid size-7 place-items-center"
        >
          <X className="size-4 text-main" strokeWidth={1.7} />
        </button>
      )}
    </>
  );

  const className = cn(
    'flex h-[88px] w-full items-center gap-3 rounded-[20px] bg-card px-3 py-5',
    selected && 'border border-line-active',
    disabled && 'cursor-not-allowed opacity-60',
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(className, 'text-left')}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

export function SheetOption({
  title,
  description,
  helper,
  onClick,
  disabled = false,
}: {
  title: string;
  description: string;
  helper: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl border border-line bg-card px-4 py-3.5 text-left shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <p className="typo-body-md-bold text-main">{title}</p>
      <p className="typo-body-xs-regular mt-2.5 text-main">{description}</p>
      <p className="typo-body-xs-regular mt-[7px] text-faint">{helper}</p>
    </button>
  );
}

export function DirectCollaboratorSheet({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isValid = value.trim().length > 0;
  const inputId = 'direct-collaborator-name';

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="공동 작업자 이름 입력"
      subtitle="팀원이 아니거나 비회원인 공동 작업자는 이름만 표시돼요."
    >
      <div className="flex min-h-[304px] flex-col px-5">
        <section className="mt-4 flex flex-col gap-1">
          <RequiredLabel required htmlFor={inputId}>
            <span className="typo-body-sm-regular">공동 작업자 이름</span>
          </RequiredLabel>
          <input
            id={inputId}
            value={value}
            maxLength={ARTWORK_REGISTER_AUTHOR_NAME_MAX_LENGTH}
            onChange={(e) => onChange(e.target.value)}
            className="typo-body-xs-regular mt-3 h-9 rounded-lg border border-input-border bg-card px-3 text-main outline-none focus:border-line-active"
          />
          <p className="typo-body-xs-regular text-faint">
            직접 입력한 이름은 프로필과 연결되지 않아요.
          </p>
        </section>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid}
          className={cn(
            'typo-body-sm-bold mt-auto h-11 w-full rounded-xl',
            isValid ? 'bg-dark text-white' : 'bg-bt-gray text-faint',
          )}
        >
          추가하기
        </button>
      </div>
    </BottomSheet>
  );
}
