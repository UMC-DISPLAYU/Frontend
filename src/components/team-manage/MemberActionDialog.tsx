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
        <span className="mt-0.5 block text-[14px] leading-[1.4] font-normal tracking-[-0.03em] whitespace-pre-line text-[#71717b]">
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
            className="h-11 flex-1 rounded-[12px] bg-[#f0f0f3] text-[14px] font-semibold tracking-[-0.03em] text-[#18181b] transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-[#e4e4e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-[.98]"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="h-11 flex-1 rounded-[12px] bg-[#fb2c36] text-[14px] font-semibold tracking-[-0.03em] text-[#fff] transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-[#d63c41] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b] active:scale-[.98] disabled:cursor-default disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8] disabled:active:scale-100"
          >
            {copy.confirmLabel}
          </button>
        </div>
      }
    >
      <div className="mt-2 rounded-[12px] bg-[#ffe2e2] px-3.5 py-3 tracking-[-0.03em]">
        <p className="text-[12px] leading-[1.4] font-semibold text-[#fb2c36]">작품 삭제 안내</p>
        <p className="mt-0.5 text-[12px] leading-[1.4] font-medium whitespace-pre-line text-[#3f3f47]">
          {'작가로 등록된 작품이 있다면 함께 삭제돼요\n삭제된 작품은 복구할 수 없어요'}
        </p>
        {errorMessage && (
          <p role="alert" className="mt-1 text-[12px] leading-[1.4] font-medium text-[#fb2c36]">
            {errorMessage}
          </p>
        )}
      </div>
    </Overlay>
  );
}
