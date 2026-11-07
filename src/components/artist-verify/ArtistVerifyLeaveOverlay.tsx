import { useRef } from 'react';

import { Overlay } from '@/components/ui';

type ArtistVerifyLeaveOverlayProps = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

const buttonClass =
  'typography-body-lg-semibold h-11 flex-1 cursor-pointer rounded-12 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99';

export function ArtistVerifyLeaveOverlay({ open, onStay, onLeave }: ArtistVerifyLeaveOverlayProps) {
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      description="입력한 내용은 저장되지 않아요."
      footer={
        <div className="flex gap-2">
          <button
            className={`${buttonClass} bg-secondary text-primary`}
            onClick={onStay}
            ref={stayButtonRef}
            type="button"
          >
            계속 작성
          </button>
          <button
            className={`${buttonClass} bg-interactive-primary text-interactive-inverse hover:bg-interactive-primary-hover active:bg-interactive-primary-press`}
            onClick={onLeave}
            type="button"
          >
            나가기
          </button>
        </div>
      }
      initialFocusRef={stayButtonRef}
      onClose={onStay}
      open={open}
      role="alertdialog"
      showCloseButton={false}
      size="sm"
      title="작가 인증을 그만할까요?"
    />
  );
}
