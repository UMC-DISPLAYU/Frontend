import { type RefObject, useLayoutEffect } from 'react';

/*
 * 포스터 카드 슬라이드의 옆 칸 모습(크기 · 위치 · 어둡기)을 스크롤 위치에 묶는다(프로토타입 home.html 과 같은 방식).
 * 칸이 가운데에 가까울수록 커지고 밝아지며, 손가락을 따라 연속으로 바뀐다. 맞춤(snap)은 브라우저에 맡긴다.
 * - ViewTimeline 을 지원하면(크롬 115+ · 사파리 26+) 스크롤 연동 애니메이션으로 메인 스레드와 무관하게 돌린다.
 * - 지원하지 않거나 실제로 돌지 않으면 스크롤 때마다 transform · opacity 만 직접 바꾼다.
 * - 동작 줄이기에서는 아무것도 하지 않는다. 칸 클래스(가운데 / 옆)로 모습이 바로 바뀐다.
 * 각 칸 안의 요소는 data-slide-part 로 찾는다: poster · info · side-shade · active-shade
 */

// 프로토타입 --side: 옆 칸 포스터 비율. 위치는 포스터 폭 232 기준 14px 를 폭에 비례해 쓴다
const SIDE_SCALE = 0.9138;
const SIDE_OFFSET_RATIO = 14 / 232;

type ViewTimelineConstructor = new (options: {
  subject: Element;
  axis: 'inline' | 'block' | 'x' | 'y';
}) => AnimationTimeline;

type ScrollLinkedOptions = KeyframeAnimationOptions & { rangeStart: string; rangeEnd: string };

interface SlideParts {
  slot: HTMLElement;
  poster: HTMLElement | null;
  info: HTMLElement | null;
  sideShade: HTMLElement | null;
  activeShade: HTMLElement | null;
}

const collectParts = (rail: HTMLElement): SlideParts[] =>
  Array.from(rail.children, (child) => {
    const slot = child as HTMLElement;
    const part = (name: string) => slot.querySelector<HTMLElement>(`[data-slide-part="${name}"]`);
    return {
      slot,
      poster: part('poster'),
      info: part('info'),
      sideShade: part('side-shade'),
      activeShade: part('active-shade'),
    };
  });

const measure = (rail: HTMLElement, parts: SlideParts[]) => {
  const width = parts[0]?.slot.offsetWidth ?? 0;
  const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
  return { width, offset: width * SIDE_OFFSET_RATIO, span: width + gap };
};

const posterTransform = (offset: number, progress: number) =>
  `translate3d(0, ${((1 - progress) * offset).toFixed(2)}px, 0) scale(${(SIDE_SCALE + (1 - SIDE_SCALE) * progress).toFixed(4)})`;

const infoTransform = (offset: number, progress: number) =>
  `translate3d(0, ${(-(1 - progress) * offset).toFixed(2)}px, 0)`;

function startScrollLinked(rail: HTMLElement, parts: SlideParts[]) {
  const ViewTimelineCtor = (window as unknown as { ViewTimeline?: ViewTimelineConstructor })
    .ViewTimeline;
  if (!ViewTimelineCtor) return null;

  const { offset, span } = measure(rail, parts);
  const options = (timeline: AnimationTimeline): ScrollLinkedOptions => ({
    timeline,
    fill: 'both',
    easing: 'linear',
    rangeStart: `cover calc(50% - ${span}px)`,
    rangeEnd: `cover calc(50% + ${span}px)`,
  });
  const side = posterTransform(offset, 0);
  const sideInfo = infoTransform(offset, 0);

  const animations: Animation[] = [];
  try {
    for (const { slot, poster, info, sideShade, activeShade } of parts) {
      const timeline = new ViewTimelineCtor({ subject: slot, axis: 'inline' });
      const play = (element: HTMLElement | null, keyframes: Keyframe[]) => {
        if (element) animations.push(element.animate(keyframes, options(timeline)));
      };
      play(poster, [{ transform: side }, { transform: 'none' }, { transform: side }]);
      play(info, [{ transform: sideInfo }, { transform: 'none' }, { transform: sideInfo }]);
      play(sideShade, [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }]);
      play(activeShade, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }]);
    }
  } catch {
    animations.forEach((animation) => animation.cancel());
    return null;
  }
  return animations;
}

function startScrollPaint(rail: HTMLElement, parts: SlideParts[]) {
  let geometry = measure(rail, parts);
  // 칸 가운데 위치는 미리 읽어 두고 스크롤 중에는 레이아웃을 다시 읽지 않는다
  let centers = parts.map(({ slot }) => slot.offsetLeft + geometry.width / 2);
  const last = parts.map(() => -1);
  let frame = 0;

  const paint = () => {
    const center = rail.scrollLeft + rail.clientWidth / 2;
    parts.forEach(({ poster, info, sideShade, activeShade }, index) => {
      const raw = Math.max(0, 1 - Math.abs(centers[index] - center) / geometry.span);
      const progress = Math.round(raw * 200) / 200;
      if (progress === last[index]) return;
      last[index] = progress;
      if (poster) poster.style.transform = posterTransform(geometry.offset, progress);
      if (info) info.style.transform = infoTransform(geometry.offset, progress);
      if (sideShade) sideShade.style.opacity = (1 - progress).toFixed(3);
      if (activeShade) activeShade.style.opacity = progress.toFixed(3);
    });
  };
  const onScroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(paint);
  };
  const remeasure = () => {
    geometry = measure(rail, parts);
    centers = parts.map(({ slot }) => slot.offsetLeft + geometry.width / 2);
    last.fill(-1);
    paint();
  };

  paint();
  rail.addEventListener('scroll', onScroll, { passive: true });
  const observer = new ResizeObserver(remeasure);
  observer.observe(rail);

  return () => {
    cancelAnimationFrame(frame);
    rail.removeEventListener('scroll', onScroll);
    observer.disconnect();
    parts.forEach(({ poster, info, sideShade, activeShade }) => {
      for (const element of [poster, info, sideShade, activeShade])
        element?.removeAttribute('style');
    });
  };
}

export function usePosterSlideMotion(railRef: RefObject<HTMLElement>, itemsKey: string) {
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail || !itemsKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const parts = collectParts(rail);
    let stopPaint: (() => void) | null = null;
    let animations = startScrollLinked(rail, parts);
    if (!animations) stopPaint = startScrollPaint(rail, parts);

    // 칸 폭 · 간격이 바뀌면(브레이크포인트) 범위를 다시 잡는다
    let width = rail.clientWidth;
    const observer = new ResizeObserver(() => {
      if (!animations || rail.clientWidth === width) return;
      width = rail.clientWidth;
      animations.forEach((animation) => animation.cancel());
      animations = startScrollLinked(rail, parts);
      if (!animations) stopPaint = startScrollPaint(rail, parts);
    });
    observer.observe(rail);

    // 지원한다고 나와도 타임라인이 꺼져 있으면 시간이 잡히지 않는다. 그러면 직접 그리는 방식으로 바꾼다
    const verify = window.setTimeout(() => {
      if (!animations?.length || animations[0].currentTime !== null) return;
      animations.forEach((animation) => animation.cancel());
      animations = null;
      stopPaint = startScrollPaint(rail, parts);
    }, 400);

    return () => {
      window.clearTimeout(verify);
      observer.disconnect();
      animations?.forEach((animation) => animation.cancel());
      stopPaint?.();
    };
  }, [railRef, itemsKey]);
}
