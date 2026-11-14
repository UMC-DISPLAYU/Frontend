import { type MouseEvent, type SyntheticEvent, useEffect, useRef } from 'react';

import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { useScrollLock } from '@/hooks/useScrollLock';

export type DialogEnterAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
};

/**
 * 브라우저 기본 <dialog>(showModal)로 모달을 띄운다. 포커스 가두기 · ESC · top layer 는 브라우저가 처리하고,
 * 뒤로가기로 닫기와 뒤 페이지 스크롤 잠금만 더한다.
 * 열림 애니메이션은 전역 CSS 를 건드리지 않도록 Web Animations API 로 재생한다.
 */
export function useModalDialog(
  open: boolean,
  onClose: () => void,
  getEnterAnimation: () => DialogEnterAnimation,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { requestClose } = useOverlayHistory(open, onClose);

  useScrollLock(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || dialog.open) return;

    dialog.showModal();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { keyframes, options } = getEnterAnimation();
    dialog.animate(keyframes, options);
  }, [open, getEnterAnimation]);

  // ESC 는 브라우저가 dialog 를 바로 닫아 버리므로 막고, history 기록을 되돌리는 경로로 닫는다
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    requestClose();
  };

  // dialog 자체가 클릭 대상이면 안쪽 여백 또는 바깥 어두운 영역이다. 바깥을 눌렀을 때만 닫는다
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!isInside) requestClose();
  };

  return { dialogRef, requestClose, handleCancel, handleBackdropClick };
}
