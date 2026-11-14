import { useId } from 'react';

import { type DialogEnterAnimation, useModalDialog } from '@/hooks/useModalDialog';
import { cn } from '@/utils/cn';

type Props = {
  open: boolean;
  description: string;
  onConfirm: () => void;
  /** 나중에 · 배경 탭 · ESC · 뒤로가기 */
  onCancel: () => void;
};

// 프로토타입 my.html 확인 모달: 모든 화면에서 가운데, 살짝 커지며 나타남
const getEnterAnimation = (): DialogEnterAnimation => ({
  keyframes: [{ opacity: 0, transform: 'scale(.96)' }, {}],
  options: { duration: 250, easing: 'cubic-bezier(.16,1,.3,1)' },
});

const ACTION_BUTTON =
  'inline-flex h-11 cursor-pointer items-center justify-center rounded-[12px] text-[14px] font-semibold [transition:background_.2s,transform_.2s_cubic-bezier(.16,1,.3,1)] active:scale-98';

export function ArtistVerificationModal({ open, description, onConfirm, onCancel }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const { dialogRef, requestClose, handleCancel, handleBackdropClick } = useModalDialog(
    open,
    onCancel,
    getEnterAnimation,
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="m-auto w-[min(322px,calc(100vw-80px))] max-w-none rounded-[20px] border-0 bg-[#fff] px-5 pt-6 pb-5 text-left text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#18181b] [&_*]:tracking-[-0.03em] backdrop:bg-[rgba(0,0,0,0.42)]"
    >
      <h2 id={titleId} className="text-[20px] leading-[1.4] font-bold">
        작가 인증이 필요해요
      </h2>
      <p
        id={descriptionId}
        className="mt-2 text-[14px] leading-[1.4] font-normal whitespace-pre-line text-[#71717b]"
      >
        {description}
      </p>

      <div className="mt-4 grid auto-cols-fr grid-flow-col gap-2">
        <button
          type="button"
          onClick={requestClose}
          className={cn(ACTION_BUTTON, 'bg-[#f0f0f3] hover:bg-[#e4e4e7]')}
        >
          나중에
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(ACTION_BUTTON, 'bg-[#18181b] text-[#fff] hover:bg-[#2f2f35]')}
        >
          작가 인증하기
        </button>
      </div>
    </dialog>
  );
}
