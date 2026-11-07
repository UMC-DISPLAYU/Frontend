import { useRef } from 'react';

import { Overlay } from '@/components/ui';

interface ContentDeleteConfirmDialogProps {
  open: boolean;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ContentDeleteConfirmDialog({
  open,
  isDeleting = false,
  errorMessage,
  onCancel,
  onConfirm,
}: ContentDeleteConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      open={open}
      onClose={onCancel}
      title="섹션을 삭제할까요?"
      description="섹션에 등록된 사진도 함께 삭제돼요"
      role="alertdialog"
      size="sm"
      presentation="modal"
      className="max-w-80.5"
      showCloseButton={false}
      initialFocusRef={cancelButtonRef}
      footer={
        <div className="flex gap-2">
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
            disabled={isDeleting}
            onClick={onConfirm}
            className="typography-body-lg-semibold h-11 flex-1 rounded-12 bg-notice text-interactive-inverse transition duration-fast ease-standard hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100"
          >
            {isDeleting ? '삭제 중…' : '삭제하기'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 rounded-8 bg-error-subtle p-3">
        <p className="typography-body-md-semibold text-error">삭제 안내</p>
        <p className="typography-body-md-medium text-secondary">삭제된 섹션은 복구할 수 없어요</p>
        {errorMessage && (
          <p role="alert" className="typography-body-md-medium text-error">
            {errorMessage}
          </p>
        )}
      </div>
    </Overlay>
  );
}
