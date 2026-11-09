import { useRef } from 'react';

import { Overlay } from '@/components/ui';

interface DisplayHubConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  warning?: { title: string; description: string };
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  isPending: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DisplayHubConfirmDialog({
  open,
  title,
  description,
  warning,
  confirmLabel,
  pendingLabel,
  cancelLabel = '취소',
  isPending,
  errorMessage,
  onCancel,
  onConfirm,
}: DisplayHubConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      open={open}
      onClose={onCancel}
      title={title}
      description={
        <span className="typography-body-lg-regular mt-0.5 block whitespace-pre-line text-tertiary">
          {description}
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
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="typography-body-lg-semibold h-11 flex-1 rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100"
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      }
    >
      {(warning || errorMessage) && (
        <div className="flex flex-col gap-1 rounded-8 bg-error-subtle p-3">
          {warning && (
            <>
              <p className="typography-body-md-semibold text-error">{warning.title}</p>
              <p className="typography-body-md-medium text-secondary">{warning.description}</p>
            </>
          )}
          {errorMessage && (
            <p role="alert" className="typography-body-md-medium text-error">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </Overlay>
  );
}
