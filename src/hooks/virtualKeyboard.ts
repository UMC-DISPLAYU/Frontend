/**
 * 가상 키보드 추적. 앱 전체에서 VisualViewport 를 한 번만 구독하고,
 * 키보드가 가린 높이를 CSS 변수(--semantic-layout-keyboard-inset)와 스토어 값으로 내보낸다.
 * React 에서는 useVirtualKeyboard.ts 의 훅으로 쓴다.
 */

const KEYBOARD_INSET_CSS_VAR = '--semantic-layout-keyboard-inset';

// 브라우저 툴바 · 반올림 오차로 생기는 작은 차이는 키보드로 보지 않는다
const KEYBOARD_INSET_NOISE = 40;
// 일부 Android 브라우저(Chrome 108 미만 등)는 키보드가 열리면 레이아웃 자체가 줄어 inset 이 0 이 되므로, 높이 감소량으로 열림을 판단한다
const KEYBOARD_MIN_HEIGHT = 120;
const FOCUS_SCROLL_MARGIN = 16;
// 키보드가 올라오는 애니메이션과 브라우저 기본 스크롤이 끝난 뒤에 보정한다
const ENSURE_VISIBLE_DELAY = 150;

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'file',
  'hidden',
  'image',
  'month',
  'radio',
  'range',
  'reset',
  'submit',
  'time',
  'week',
]);

export type KeyboardViewportMetrics = {
  /** window.innerHeight (레이아웃 뷰포트 높이) */
  layoutHeight: number;
  /** visualViewport.height */
  viewportHeight: number;
  /** visualViewport.offsetTop */
  viewportOffsetTop: number;
  /** visualViewport.scale */
  scale: number;
};

/** 레이아웃 뷰포트 아래쪽에서 키보드가 가린 높이(px). 키보드가 없거나 판단할 수 없으면 0 */
export function computeKeyboardInset({
  layoutHeight,
  viewportHeight,
  viewportOffsetTop,
  scale,
}: KeyboardViewportMetrics): number {
  // 핀치 줌 중에는 visual viewport 가 줄어든 것이 키보드 때문인지 구분할 수 없어 따라가지 않는다
  if (Math.abs(scale - 1) > 0.01) return 0;

  const covered = layoutHeight - viewportHeight - viewportOffsetTop;
  if (covered < KEYBOARD_INSET_NOISE) return 0;
  return Math.round(covered);
}

export function detectKeyboardOpen({
  inset,
  layoutHeight,
  baselineLayoutHeight,
  hasEditableFocus,
}: {
  inset: number;
  layoutHeight: number;
  /** 같은 화면 폭에서 지금까지 본 가장 큰 layoutHeight */
  baselineLayoutHeight: number;
  hasEditableFocus: boolean;
}): boolean {
  if (inset > 0) return true;
  if (!hasEditableFocus) return false;
  return baselineLayoutHeight - layoutHeight >= KEYBOARD_MIN_HEIGHT;
}

/**
 * 포커스된 요소가 보이는 영역 안에 들어오도록 window 를 얼마나 스크롤할지(px, 양수면 아래로).
 * 모든 값은 레이아웃 뷰포트 기준 client 좌표다.
 */
export function computeFocusScrollDelta({
  targetTop,
  targetBottom,
  visibleTop,
  visibleBottom,
  margin = FOCUS_SCROLL_MARGIN,
}: {
  targetTop: number;
  targetBottom: number;
  visibleTop: number;
  /** 하단 고정 바 높이를 뺀 보이는 영역의 아래쪽 */
  visibleBottom: number;
  margin?: number;
}): number {
  const minTop = visibleTop + margin;
  const maxBottom = visibleBottom - margin;
  if (maxBottom <= minTop) return 0;

  // 보이는 영역보다 큰 요소(긴 textarea 등)는 윗부분만 맞춘다
  if (targetBottom - targetTop > maxBottom - minTop) {
    const isTopVisible = targetTop >= minTop && targetTop < maxBottom;
    return isTopVisible ? 0 : Math.round(targetTop - minTop);
  }
  if (targetBottom > maxBottom) return Math.round(targetBottom - maxBottom);
  if (targetTop < minTop) return Math.round(targetTop - minTop);
  return 0;
}

export function isTextEditableElement(element: Element | null): element is HTMLElement {
  if (!element) return false;
  if ((element as HTMLElement).isContentEditable) return true;

  const { tagName } = element;
  if (tagName === 'TEXTAREA') {
    const textarea = element as HTMLTextAreaElement;
    return !textarea.readOnly && !textarea.disabled;
  }
  if (tagName === 'INPUT') {
    const input = element as HTMLInputElement;
    return !NON_TEXT_INPUT_TYPES.has(input.type) && !input.readOnly && !input.disabled;
  }
  return false;
}

// ---- 스토어 ----

type KeyboardState = { inset: number; isOpen: boolean };

let state: KeyboardState = { inset: 0, isOpen: false };
let baseline = { width: 0, height: 0 };
const listeners = new Set<() => void>();
let subscriberCount = 0;
let stopTracking: (() => void) | null = null;
let frameId = 0;
let ensureVisibleTimer: ReturnType<typeof setTimeout> | undefined;

const bottomObstructions = new Map<HTMLElement, number>();

function readState(): KeyboardState {
  const vv = window.visualViewport;
  const layoutHeight = window.innerHeight;
  const layoutWidth = window.innerWidth;

  if (layoutWidth !== baseline.width) {
    baseline = { width: layoutWidth, height: layoutHeight };
  } else if (layoutHeight > baseline.height) {
    baseline = { ...baseline, height: layoutHeight };
  }

  const inset = vv
    ? computeKeyboardInset({
        layoutHeight,
        viewportHeight: vv.height,
        viewportOffsetTop: vv.offsetTop,
        scale: vv.scale,
      })
    : 0;

  const isOpen = detectKeyboardOpen({
    inset,
    layoutHeight,
    baselineLayoutHeight: baseline.height,
    hasEditableFocus: isTextEditableElement(document.activeElement),
  });

  return { inset, isOpen };
}

function update() {
  const next = readState();
  if (next.inset === state.inset && next.isOpen === state.isOpen) return;

  if (next.inset !== state.inset) {
    document.documentElement.style.setProperty(KEYBOARD_INSET_CSS_VAR, `${next.inset}px`);
  }
  state = next;
  listeners.forEach((listener) => listener());
}

function scheduleUpdate() {
  if (frameId) return;
  frameId = requestAnimationFrame(() => {
    frameId = 0;
    update();
  });
}

function isInsideFixedElement(element: HTMLElement) {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    if (getComputedStyle(node).position === 'fixed') return true;
  }
  return false;
}

function getMaxBottomObstruction() {
  let max = 0;
  bottomObstructions.forEach((height) => {
    max = Math.max(max, height);
  });
  return max;
}

function ensureFocusedVisible() {
  const element = document.activeElement;
  if (!isTextEditableElement(element)) return;

  const vv = window.visualViewport;
  if (vv && Math.abs(vv.scale - 1) > 0.01) return;

  // 하단 바 안의 입력창, 오버레이(fixed) 안의 입력창은 window 스크롤로 옮길 수 없다
  for (const obstruction of bottomObstructions.keys()) {
    if (obstruction.contains(element)) return;
  }
  if (isInsideFixedElement(element)) return;

  const visibleTop = vv ? vv.offsetTop : 0;
  const visibleHeight = vv ? vv.height : window.innerHeight;
  const rect = element.getBoundingClientRect();

  const delta = computeFocusScrollDelta({
    targetTop: rect.top,
    targetBottom: rect.bottom,
    visibleTop,
    visibleBottom: visibleTop + visibleHeight - getMaxBottomObstruction(),
  });
  if (delta === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollBy({ top: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function scheduleEnsureVisible() {
  clearTimeout(ensureVisibleTimer);
  ensureVisibleTimer = setTimeout(ensureFocusedVisible, ENSURE_VISIBLE_DELAY);
}

function startTracking() {
  const vv = window.visualViewport;

  // 키보드가 열리고 닫힐 때는 resize, iOS 에서 키보드가 열린 채 화면이 밀릴 때는 scroll 이 온다.
  // scroll 에서는 입력창 보정을 하지 않는다(사용자 스크롤을 되돌리지 않도록).
  const handleResize = () => {
    scheduleUpdate();
    scheduleEnsureVisible();
  };
  const handleFocusIn = (event: FocusEvent) => {
    scheduleUpdate();
    if (isTextEditableElement(event.target as Element | null)) scheduleEnsureVisible();
  };

  vv?.addEventListener('resize', handleResize);
  vv?.addEventListener('scroll', scheduleUpdate);
  window.addEventListener('resize', handleResize);
  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', scheduleUpdate);
  update();

  return () => {
    vv?.removeEventListener('resize', handleResize);
    vv?.removeEventListener('scroll', scheduleUpdate);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('focusin', handleFocusIn);
    document.removeEventListener('focusout', scheduleUpdate);
    cancelAnimationFrame(frameId);
    frameId = 0;
    clearTimeout(ensureVisibleTimer);
    document.documentElement.style.removeProperty(KEYBOARD_INSET_CSS_VAR);
    state = { inset: 0, isOpen: false };
    baseline = { width: 0, height: 0 };
  };
}

/** 구독자가 하나라도 있는 동안만 추적한다(첫 구독에 시작, 마지막 해제에 정리) */
export function subscribeVirtualKeyboard(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) stopTracking = startTracking();

  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;
    if (subscriberCount === 0) {
      stopTracking?.();
      stopTracking = null;
    }
  };
}

export function getKeyboardInset() {
  return state.inset;
}

export function getIsKeyboardOpen() {
  return state.isOpen;
}

function applyScrollPaddingBottom() {
  const max = getMaxBottomObstruction();
  const { style } = document.documentElement;
  // 브라우저 기본 포커스 스크롤 · scrollIntoView 도 하단 고정 바를 피하게 한다
  if (max > 0) style.scrollPaddingBottom = `${max}px`;
  else style.removeProperty('scroll-padding-bottom');
}

/** 화면 하단을 가리는 고정 요소(하단 고정 바 등)의 높이를 등록한다. 입력창 보정 · scroll-padding 에 쓴다 */
export function setBottomObstruction(element: HTMLElement, height: number) {
  bottomObstructions.set(element, height);
  applyScrollPaddingBottom();
}

export function removeBottomObstruction(element: HTMLElement) {
  bottomObstructions.delete(element);
  applyScrollPaddingBottom();
}
