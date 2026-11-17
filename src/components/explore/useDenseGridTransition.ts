import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// 프로토타입 보기 전환(U-165) 값
const VIEWPORT_MARGIN = 200;
const FLIP_OPTIONS: KeyframeAnimationOptions = {
  duration: 420,
  easing: 'cubic-bezier(.77, 0, .175, 1)',
};
const APPEAR_OPTIONS: KeyframeAnimationOptions = {
  duration: 260,
  delay: 120,
  easing: 'cubic-bezier(.23, 1, .32, 1)',
  fill: 'backwards',
};
const TEXT_FADE_OPTIONS: KeyframeAnimationOptions = {
  duration: 240,
  delay: 160,
  easing: 'cubic-bezier(.16, 1, .3, 1)',
  fill: 'backwards',
};
const PINCH_IN_RATIO = 0.78;
const PINCH_OUT_RATIO = 1.28;
const WHEEL_THRESHOLD = 40;
const WHEEL_RESET_MS = 260;

type Snapshot = {
  rects: Map<string, DOMRect>;
  anchor: { key: string; top: number } | null;
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isNearViewport = (rect: DOMRect) =>
  rect.bottom > -VIEWPORT_MARGIN && rect.top < window.innerHeight + VIEWPORT_MARGIN;

const getCards = (list: HTMLElement | null) =>
  Array.from(list?.querySelectorAll<HTMLElement>('[data-flip-key]') ?? []);

function takeSnapshot(list: HTMLElement | null, topInset: number): Snapshot {
  const rects = new Map<string, DOMRect>();
  let anchor: Snapshot['anchor'] = null;
  for (const card of getCards(list)) {
    const key = card.dataset.flipKey ?? '';
    const rect = card.getBoundingClientRect();
    if (!anchor && rect.bottom > topInset + 8) anchor = { key, top: rect.top };
    if (isNearViewport(rect)) rects.set(key, rect);
  }
  return { rects, anchor };
}

function playTransition(list: HTMLElement | null, snapshot: Snapshot, dense: boolean) {
  const cards = getCards(list);

  // 보던 사진이 그 자리에 머물게 한다
  const anchorCard = cards.find((card) => card.dataset.flipKey === snapshot.anchor?.key);
  if (anchorCard && snapshot.anchor) {
    window.scrollBy(0, anchorCard.getBoundingClientRect().top - snapshot.anchor.top);
  }

  if (prefersReducedMotion()) return;

  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    if (!isNearViewport(rect)) continue;

    if (!dense) {
      card
        .querySelector('[data-card-text]')
        ?.animate([{ opacity: 0 }, { opacity: 1 }], TEXT_FADE_OPTIONS);
    }

    const first = snapshot.rects.get(card.dataset.flipKey ?? '');
    if (!first) {
      card.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'none' },
        ],
        APPEAR_OPTIONS,
      );
      continue;
    }

    const dx = first.left - rect.left;
    const dy = first.top - rect.top;
    // 가로 배율 하나로 키워 사진 비율을 그대로 둔다
    const scale = first.width / rect.width;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(scale - 1) < 0.01) continue;
    card.animate(
      [
        { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transformOrigin: '0 0', transform: 'none' },
      ],
      FLIP_OPTIONS,
    );
  }
}

type UseDenseGridTransitionOptions = {
  dense: boolean;
  onChange: (dense: boolean) => void;
  /** 화면 위에 붙어 있는 요소의 아래 끝. 그 아래 처음 보이는 사진을 기준으로 스크롤을 맞춘다 */
  getTopInset: () => number;
};

/**
 * 기본 ↔ 촘촘히 보기 전환. 같은 사진은 원래 자리에서 새 자리로 미끄러지고(FLIP), 새로 보이는 칸은 옅게 나타난다.
 * 목록 위 두 손가락 오므리기 / 벌리기와 노트북 ctrl+휠(터치패드 오므리기)로도 바꾼다.
 */
export function useDenseGridTransition({
  dense,
  onChange,
  getTopInset,
}: UseDenseGridTransitionOptions) {
  const listRef = useRef<HTMLElement>(null);
  const snapshotRef = useRef<Snapshot | null>(null);

  const changeDense = useCallback(
    (nextDense: boolean) => {
      if (nextDense === dense) return;
      snapshotRef.current = takeSnapshot(listRef.current, getTopInset());
      onChange(nextDense);
    },
    [dense, getTopInset, onChange],
  );

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    if (snapshot) playTransition(listRef.current, snapshot, dense);
  }, [dense]);

  const changeDenseRef = useRef(changeDense);
  useLayoutEffect(() => {
    changeDenseRef.current = changeDense;
  });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const distance = (touches: TouchList) =>
      Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

    // 한 번 오므리면 촘촘히, 벌리면 기본
    let pinch: { start: number; done: boolean } | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) pinch = { start: distance(event.touches), done: false };
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (!pinch || pinch.done || event.touches.length !== 2) return;
      const ratio = distance(event.touches) / pinch.start;
      if (ratio < PINCH_IN_RATIO) {
        pinch.done = true;
        changeDenseRef.current(true);
      } else if (ratio > PINCH_OUT_RATIO) {
        pinch.done = true;
        changeDenseRef.current(false);
      }
    };
    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) pinch = null;
    };
    // iOS Safari: 목록 위에서는 페이지 확대 대신 보기를 바꾼다
    const handleGestureStart = (event: Event) => {
      if (event.target instanceof Node && list.contains(event.target)) event.preventDefault();
    };

    let wheelDelta = 0;
    let wheelTimer = 0;
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      wheelDelta += event.deltaY;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        wheelDelta = 0;
      }, WHEEL_RESET_MS);
      if (Math.abs(wheelDelta) <= WHEEL_THRESHOLD) return;
      const nextDense = wheelDelta > 0;
      wheelDelta = 0;
      changeDenseRef.current(nextDense);
    };

    list.addEventListener('touchstart', handleTouchStart, { passive: true });
    list.addEventListener('touchmove', handleTouchMove, { passive: true });
    list.addEventListener('touchend', handleTouchEnd);
    list.addEventListener('touchcancel', handleTouchEnd);
    list.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('gesturestart', handleGestureStart);
    return () => {
      list.removeEventListener('touchstart', handleTouchStart);
      list.removeEventListener('touchmove', handleTouchMove);
      list.removeEventListener('touchend', handleTouchEnd);
      list.removeEventListener('touchcancel', handleTouchEnd);
      list.removeEventListener('wheel', handleWheel);
      document.removeEventListener('gesturestart', handleGestureStart);
      window.clearTimeout(wheelTimer);
    };
  }, []);

  return { listRef, changeDense };
}
