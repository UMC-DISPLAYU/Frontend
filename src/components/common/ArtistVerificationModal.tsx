import { useRef } from 'react';

import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';

type Props = {
  open: boolean;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ACTION_BUTTON =
  'typography-body-lg-semibold h-11 cursor-pointer rounded-12 transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98';

export function ArtistVerificationModal({ open, description, onConfirm, onCancel }: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      open={open}
      onClose={onCancel}
      // 공용 Overlay 제목은 700이지만 사용자 지시로 볼드를 빼 600으로 둔다
      title={<span className="font-semibold">작가 인증이 필요해요</span>}
      description={
        <span className="typography-body-lg-regular mt-0.5 block whitespace-pre-line text-tertiary">
          {description}
        </span>
      }
      role="alertdialog"
      size="sm"
      presentation="modal"
      // 프로토타입 확인 모달: 폭 min(322px, 화면 폭 − 80px), 위 여백 24px, 그림자 없음
      className="max-w-[min(322px,calc(100vw-80px))] pt-1 shadow-none"
      showCloseButton={false}
      initialFocusRef={cancelButtonRef}
      footer={
        <div className="-mt-1 grid grid-cols-2 gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className={cn(ACTION_BUTTON, 'bg-tertiary text-primary hover:bg-[#e4e4e7]')}
          >
            나중에
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              ACTION_BUTTON,
              'bg-interactive-primary text-interactive-inverse hover:bg-[#2f2f35]',
            )}
          >
            작가 인증하기
          </button>
        </div>
      }
    />
  );
}
