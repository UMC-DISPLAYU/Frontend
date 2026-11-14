import { useRef } from 'react';

import { ConfirmDialog } from '@/components/common';
import { Overlay } from '@/components/ui';

import { MEMBER_ACTION_COPY, type MemberAction } from './memberActions';

interface MemberActionDialogProps {
  open: boolean;
  /** 닫히는 애니메이션 동안에도 문구가 남도록 닫은 뒤에도 마지막 동작을 넘긴다 */
  action: MemberAction | null;
  isPending: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MemberActionDialog({ action, open, ...props }: MemberActionDialogProps) {
  const copy = action ? MEMBER_ACTION_COPY[action] : null;

  return (
    <>
      <ConfirmDialog
        open={open && action !== 'kick'}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        confirmLabel={copy?.confirmLabel ?? ''}
        {...props}
      />
      <KickMemberDialog open={open && action === 'kick'} {...props} />
    </>
  );
}

/* 내보내기만 확인 버튼이 빨간색이라 공용 ConfirmDialog 대신 같은 모양으로 따로 그린다 */
function KickMemberDialog({
  open,
  isPending,
  errorMessage,
  onCancel,
  onConfirm,
}: Omit<MemberActionDialogProps, 'action'>) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const copy = MEMBER_ACTION_COPY.kick;

  return (
    <Overlay
      open={open}
      onClose={onCancel}
      title={copy.title}
      description={
        <span className="typography-body-lg-regular mt-0.5 block text-tertiary">
          {copy.description}
        </span>
      }
      role="alertdialog"
      size="sm"
      presentation="modal"
      className="max-w-80.5 pt-1 pb-6 shadow-none"
      showCloseButton={false}
      initialFocusRef={cancelButtonRef}
      footer={
        <div className="-mt-1 flex gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="typography-body-lg-semibold h-11 flex-1 rounded-12 bg-secondary text-primary transition duration-fast ease-standard hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="typography-body-lg-semibold h-11 flex-1 rounded-12 bg-notice text-interactive-inverse transition duration-fast ease-standard hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100"
          >
            {copy.confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 rounded-8 bg-error-subtle p-3">
        <p className="typography-body-md-semibold text-error">작품 삭제 안내</p>
        <p className="typography-body-md-medium whitespace-pre-line text-secondary">
          {'작가로 등록된 작품이 있다면 함께 삭제돼요\n삭제된 작품은 복구할 수 없어요'}
        </p>
        {errorMessage && (
          <p role="alert" className="typography-body-md-medium text-error">
            {errorMessage}
          </p>
        )}
      </div>
    </Overlay>
  );
}
