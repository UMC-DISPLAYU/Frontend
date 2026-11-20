import { useEffect, useLayoutEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { useFlowBack } from '@/hooks/useFlowBack';
import { hideUnderlay, showUnderlay, skipReturnAnimations } from '@/utils/swipeBackUnderlay';

// iOS Safari · Android는 화면 왼쪽 끝 스와이프를 기본 뒤로가기로 쓴다. 겹치면 두 번 뒤로 가므로 비워 둔다
const NATIVE_EDGE_WIDTH = 24;
// 이만큼 움직인 뒤에 가로 · 세로를 판단한다. 그 전에 정하면 살짝 비스듬한 스크롤도 스와이프로 잡힌다
const DIRECTION_LOCK_DISTANCE = 10;
const COMMIT_RATIO = 0.35;
const FLICK_VELOCITY = 0.5; // px/ms
const SETTLE_MS = 300;
// 뒤로 가기가 막히거나 늦어져도 본문이 화면 밖에 남지 않게 되돌린다
const NAVIGATION_FALLBACK_MS = 1000;

type Point = { x: number; y: number };

export function isSwipeBackDirection(start: Point, current: Point) {
  const dx = current.x - start.x;
  return dx > 0 && Math.abs(current.y - start.y) < dx;
}

/** 손을 뗀 위치 · 속도로 뒤로 갈지 정한다. 반대로 되돌리다 놓으면(속도 0 이하) 취소된다 */
export function shouldCommitSwipeBack(offset: number, velocity: number, width: number) {
  if (velocity < 0) return false;
  return offset >= width * COMMIT_RATIO || (velocity >= FLICK_VELOCITY && offset > 0);
}

function resetPage() {
  const page = document.getElementById('root');
  if (page) {
    page.style.position = '';
    page.style.left = '';
    page.style.zIndex = '';
    page.style.backgroundColor = '';
    page.style.transition = '';
  }
  document.documentElement.style.overflowX = '';
  document.body.style.overflowX = '';
  hideUnderlay();
}

function isInHorizontalScroller(target: EventTarget | null) {
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    const { overflowX } = getComputedStyle(el);
    if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) {
      return true;
    }
  }
  return false;
}

/**
 * 뒤로가기 버튼이 없는 화면에서 터치 화면을 오른쪽으로 쓸면 본문이 손가락을 따라오고,
 * 충분히 쓸고 놓으면 이전 화면으로(onBack 을 주면 그 동작으로), 덜 쓸고 놓으면 제자리로 돌아간다.
 */
export function useSwipeBack(onBack?: () => void) {
  const flowBack = useFlowBack();
  const goBack = onBack ?? flowBack;
  const { key } = useLocation();

  const swipedBackRef = useRef(false);

  // 이전 화면이 그려진 뒤에 본문을 제자리로 돌린다. 이동 직후 되돌리면 떠나는 화면이 잠깐 다시 보인다
  useLayoutEffect(
    () => () => {
      if (swipedBackRef.current) skipReturnAnimations();
      swipedBackRef.current = false;
      resetPage();
    },
    [key],
  );

  useEffect(() => {
    const page = document.getElementById('root');
    if (!page) return;

    let start: Point | null = null;
    let dragging = false;
    let settling = false;
    let last = { x: 0, t: 0 };
    let velocity = 0;
    let timer: number | undefined;

    // transform 은 fixed 자식(하단 버튼 바 · 냅바)의 기준을 바꿔 화면 밖으로 튀게 하므로 relative + left 로 옮긴다.
    // fixed 요소는 제자리에 남고 본문만 움직인다
    const move = (offset: number, animate: boolean) => {
      page.style.position = 'relative';
      page.style.left = `${offset}px`;
      // 뒤에 깐 이전 화면(z 0)보다 위에 두고, 배경이 비치지 않게 칠한다
      page.style.zIndex = '1';
      page.style.backgroundColor = 'var(--semantic-color-bg-primary-white)';
      page.style.transition = animate ? `left ${SETTLE_MS}ms var(--ease-standard)` : '';
      // html 의 clip 은 뷰포트로 넘어가 모바일에서 레이아웃 뷰포트가 밀린 만큼 넓어진다(fixed 요소 폭도 같이 커짐).
      // body 에도 걸어 밀려난 본문을 body 안에서 잘라 낸다
      document.documentElement.style.overflowX = 'clip';
      document.body.style.overflowX = 'clip';
    };

    const onStart = (event: TouchEvent) => {
      start = null;
      dragging = false;
      const touch = event.touches[0];
      if (
        settling ||
        event.touches.length !== 1 ||
        touch.clientX < NATIVE_EDGE_WIDTH ||
        document.querySelector('[aria-modal="true"]') ||
        isInHorizontalScroller(event.target)
      ) {
        return;
      }
      start = { x: touch.clientX, y: touch.clientY };
      last = { x: touch.clientX, t: event.timeStamp };
      velocity = 0;
    };

    const onMove = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.touches[0];
      const current = { x: touch.clientX, y: touch.clientY };

      if (!dragging) {
        if (Math.hypot(current.x - start.x, current.y - start.y) < DIRECTION_LOCK_DISTANCE) return;
        if (!isSwipeBackDirection(start, current)) {
          start = null;
          return;
        }
        dragging = true;
        // 상세 화면은 flow 밖이라 useFlowBack 이 항상 한 칸 뒤(idx - 1)로 간다
        const idx: unknown = window.history.state?.idx;
        if (typeof idx === 'number') showUnderlay(idx - 1);
      }

      // 끄는 동안 세로 스크롤이 같이 움직이지 않게 막는다
      event.preventDefault();
      const dt = event.timeStamp - last.t;
      if (dt > 0) velocity = (current.x - last.x) / dt;
      last = { x: current.x, t: event.timeStamp };
      move(Math.max(0, current.x - start.x), false);
    };

    const settle = (commit: boolean) => {
      settling = true;
      move(commit ? window.innerWidth : 0, true);
      timer = window.setTimeout(() => {
        settling = false;
        if (!commit) {
          resetPage();
          return;
        }
        swipedBackRef.current = true;
        goBack();
        timer = window.setTimeout(() => {
          swipedBackRef.current = false;
          resetPage();
        }, NAVIGATION_FALLBACK_MS);
      }, SETTLE_MS);
    };

    const onEnd = (event: TouchEvent) => {
      if (!start) return;
      const wasDragging = dragging;
      const offset = Math.max(0, event.changedTouches[0].clientX - start.x);
      start = null;
      dragging = false;
      if (wasDragging) settle(shouldCommitSwipeBack(offset, velocity, window.innerWidth));
    };

    const onCancel = () => {
      const wasDragging = dragging;
      start = null;
      dragging = false;
      if (wasDragging) settle(false);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onCancel);
      window.clearTimeout(timer);
      resetPage();
    };
  }, [goBack]);
}
