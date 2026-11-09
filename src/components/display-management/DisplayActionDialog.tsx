import { useRef } from 'react';

import { Overlay } from '@/components/ui';

const COPY = {
  delete: {
    title: '전시를 삭제할까요?',
    description: '삭제하면 이 전시와 등록된 작품이 모두 사라져요',
    noticeTitle: '삭제 안내',
    notice: '삭제된 전시는 복구할 수 없어요',
    confirm: '삭제하기',
    pending: '삭제 중…',
  },
  leave: {
    title: '전시에서 나갈까요?',
    description:
      '나가면 이 전시의 작업 공간에 접근할 수 없어요\n다시 참여하려면 다시 초대받아야 해요',
    noticeTitle: '작품 삭제 안내',
    notice: '내가 작가로 등록된 작품이 있다면 삭제돼요\n삭제된 작품은 복구할 수 없어요',
    confirm: '나가기',
    pending: '나가는 중…',
  },
};

interface DisplayActionDialogProps {
  kind: keyof typeof COPY;
  open: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DisplayActionDialog({
  kind,
  open,
  isPending,
  errorMessage,
  onCancel,
  onConfirm,
}: DisplayActionDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const copy = COPY[kind];

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
            {isPending ? copy.pending : copy.confirm}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 rounded-8 bg-error-subtle p-3">
        <p className="typography-body-md-semibold text-error">{copy.noticeTitle}</p>
        <p className="typography-body-md-medium whitespace-pre-line text-secondary">
          {copy.notice}
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
