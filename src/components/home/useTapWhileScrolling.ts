import { type RefObject, useEffect } from 'react';

/** 마지막 scroll 이벤트 뒤 이 시간 안에 닿으면 아직 움직이는 중으로 본다 */
const SCROLL_SETTLE_MS = 120;
const TAP_SLOP_PX = 10;
const TAP_MAX_MS = 500;
/** 브라우저가 뒤늦게 click 을 보내도 한 번만 열리게 막는 시간 */
const NATIVE_CLICK_GUARD_MS = 600;

interface PendingTap {
  x: number;
  y: number;
  startedAt: number;
  link: HTMLAnchorElement;
}

/**
 * 가로 목록이 관성 · 스냅으로 아직 움직일 때 탭하면 모바일 브라우저는 멈추기만 하고 click 을 보내지 않는다.
 * 그 탭이 링크 위에서 끝나면 링크를 대신 눌러, 멈추기를 기다리지 않고 바로 열리게 한다.
 */
export function useTapWhileScrolling(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const list = ref.current;
    if (!enabled || !list) return;

    let lastScrollAt = -Infinity;
    let pending: PendingTap | null = null;
    let replayedAt = -Infinity;

    const onScroll = () => {
      lastScrollAt = performance.now();
    };

    const onTouchStart = (event: TouchEvent) => {
      pending = null;
      const now = performance.now();
      if (event.touches.length !== 1 || now - lastScrollAt > SCROLL_SETTLE_MS) return;
      const link = (event.target as Element | null)?.closest?.('a');
      if (!link || !list.contains(link)) return;
      const touch = event.touches[0];
      pending = { x: touch.clientX, y: touch.clientY, startedAt: now, link };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!pending) return;
      const touch = event.touches[0];
      if (Math.hypot(touch.clientX - pending.x, touch.clientY - pending.y) > TAP_SLOP_PX) {
        pending = null;
      }
    };

    const onTouchEnd = () => {
      const tap = pending;
      pending = null;
      if (!tap || performance.now() - tap.startedAt > TAP_MAX_MS) return;
      replayedAt = performance.now();
      tap.link.click();
    };

    const onTouchCancel = () => {
      pending = null;
    };

    const onClick = (event: MouseEvent) => {
      if (event.isTrusted && performance.now() - replayedAt < NATIVE_CLICK_GUARD_MS) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    list.addEventListener('scroll', onScroll, { passive: true });
    list.addEventListener('touchstart', onTouchStart, { passive: true });
    list.addEventListener('touchmove', onTouchMove, { passive: true });
    list.addEventListener('touchend', onTouchEnd);
    list.addEventListener('touchcancel', onTouchCancel);
    list.addEventListener('click', onClick, true);
    return () => {
      list.removeEventListener('scroll', onScroll);
      list.removeEventListener('touchstart', onTouchStart);
      list.removeEventListener('touchmove', onTouchMove);
      list.removeEventListener('touchend', onTouchEnd);
      list.removeEventListener('touchcancel', onTouchCancel);
      list.removeEventListener('click', onClick, true);
    };
  }, [ref, enabled]);
}
