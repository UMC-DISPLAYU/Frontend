import { useRef } from 'react';

import { Overlay } from '@/components/ui';

import { FOCUS_RING, PRESS_TRANSITION, PROTOTYPE_FONT, TAP_BASE } from './artistVerifyStyles';

type ArtistVerifyLeaveOverlayProps = {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
};

const buttonClass = `${PROTOTYPE_FONT} ${TAP_BASE} ${FOCUS_RING} ${PRESS_TRANSITION} h-11 rounded-[12px] text-[14px] leading-[1.4] font-semibold tracking-[-0.03em] active:scale-[.98]`;

/*
 * 프로토타입처럼 모바일에서도 가운데 모달(폭 min(322px, 100vw - 80px), 위 24 · 옆 20 · 아래 20).
 * 공용 Overlay 의 제목 아래 간격(6) · 버튼 위 간격(20)을 안쪽에서 보정해 8 · 16 으로 맞춘다.
 */
export function ArtistVerifyLeaveOverlay({ open, onStay, onLeave }: ArtistVerifyLeaveOverlayProps) {
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Overlay
      className="max-w-[min(322px,calc(100vw-80px))] pt-1"
      description={
        <span
          className={`${PROTOTYPE_FONT} mt-0.5 block text-[14px] font-normal tracking-[-0.03em] text-[#71717b]`}
        >
          입력한 내용은 저장되지 않아요.
        </span>
      }
      footer={
        <div className="-mt-1 grid grid-cols-2 gap-2">
          <button
            className={`${buttonClass} bg-[#f0f0f3] text-[#18181b] hover:bg-[#e4e4e7]`}
            onClick={onStay}
            ref={stayButtonRef}
            type="button"
          >
            계속 작성
          </button>
          <button
            className={`${buttonClass} bg-[#18181b] text-[#fff] hover:bg-[#2f2f35]`}
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
      presentation="modal"
      role="alertdialog"
      showCloseButton={false}
      size="sm"
      title={
        <span className={`${PROTOTYPE_FONT} text-[20px] font-bold tracking-[-0.03em]`}>
          작가 인증을 그만할까요?
        </span>
      }
    />
  );
}
