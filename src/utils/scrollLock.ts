interface ScrollLockTarget {
  style: Pick<CSSStyleDeclaration, 'overflow' | 'paddingRight'>;
}

/**
 * 여러 오버레이가 겹쳐 열려도 마지막 하나가 닫힐 때만 스크롤을 푼다.
 * 반환한 release 는 여러 번 불러도 한 번만 센다(StrictMode 이중 cleanup 대비).
 */
export function createScrollLock(
  getTarget: () => ScrollLockTarget,
  getScrollbarWidth: () => number,
) {
  let count = 0;
  let saved: { overflow: string; paddingRight: string } | null = null;

  return function lockScroll() {
    if (count === 0) {
      const target = getTarget();
      const scrollbarWidth = getScrollbarWidth();

      saved = { overflow: target.style.overflow, paddingRight: target.style.paddingRight };
      target.style.overflow = 'hidden';
      // 데스크톱에서 스크롤바가 사라지며 본문이 옆으로 밀리지 않게 그 폭만큼 채운다
      if (scrollbarWidth > 0) target.style.paddingRight = `${scrollbarWidth}px`;
    }

    count += 1;
    let released = false;

    return function releaseScroll() {
      if (released) return;
      released = true;
      count -= 1;

      if (count === 0 && saved) {
        const target = getTarget();
        target.style.overflow = saved.overflow;
        target.style.paddingRight = saved.paddingRight;
        saved = null;
      }
    };
  };
}

// body 가 아니라 html 을 잠근다. 기존 BottomSheet 가 body overflow 를 직접 지우므로 서로 덮어쓰지 않는다
export const lockScroll = createScrollLock(
  () => document.documentElement,
  () => window.innerWidth - document.documentElement.clientWidth,
);
