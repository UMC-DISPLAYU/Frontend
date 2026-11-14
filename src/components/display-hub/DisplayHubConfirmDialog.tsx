import { useRef } from 'react';

import { Overlay } from '@/components/ui';

// 프로토타입 hub.html 의 확인 모달(flow.css `.modal`) 값을 그대로 쓴다.
// 공용 ConfirmDialog 와 폭 · 목록 글씨 · 버튼 색 · 아래 여백이 달라 이 화면에서만 따로 그린다.
const BUTTON_CLASS =
  'typography-body-lg-semibold h-11 rounded-12 transition-[background-color,transform] duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[0.98]';

interface DisplayHubConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  list?: string[];
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
  list,
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
        list ? (
          <span className="typography-body-lg-medium mt-0.5 grid gap-0.5 text-tertiary">
            {list.map((item) => (
              <span key={item}>· {item}</span>
            ))}
          </span>
        ) : description ? (
          <span className="typography-body-lg-regular mt-0.5 block whitespace-pre-line text-tertiary">
            {description}
          </span>
        ) : undefined
      }
      role="alertdialog"
      size="sm"
      presentation="modal"
      className="max-w-[min(322px,calc(100vw-80px))] pt-1 shadow-none"
      showCloseButton={false}
      initialFocusRef={cancelButtonRef}
      footer={
        <div className="-mt-1 grid grid-cols-2 gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className={`${BUTTON_CLASS} bg-[#f0f0f3] text-primary hover:bg-[#e4e4e7]`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`${BUTTON_CLASS} bg-interactive-primary text-interactive-inverse hover:bg-[#2f2f35] disabled:cursor-default disabled:bg-secondary disabled:text-disable disabled:active:scale-100`}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      }
    >
      {(warning || errorMessage) && (
        <div className="flex flex-col gap-2">
          {warning && (
            <div className="rounded-12 bg-[#ffe2e2] px-3.5 py-3">
              <p className="typography-body-md-semibold text-[#fb2c36]">{warning.title}</p>
              <p className="typography-body-md-medium mt-0.5 whitespace-pre-line text-secondary">
                {warning.description}
              </p>
            </div>
          )}
          {errorMessage && (
            <p role="alert" className="typography-body-md-medium text-[#fb2c36]">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </Overlay>
  );
}
