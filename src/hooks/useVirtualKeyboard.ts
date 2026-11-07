import { type RefObject, useEffect, useState, useSyncExternalStore } from 'react';

import {
  getBottomObstructionHeight,
  getIsKeyboardOpen,
  getKeyboardInset,
  removeBottomObstruction,
  setBottomObstruction,
  subscribeBottomObstruction,
  subscribeVirtualKeyboard,
} from './virtualKeyboard';

const noop = () => {};

/**
 * 가상 키보드 추적을 켠다. 켜져 있는 동안 :root 의 --semantic-layout-keyboard-inset 이 갱신된다.
 * Layout 이 호출하므로 Layout 아래 화면에서는 따로 부를 필요가 없다.
 */
export function useVirtualKeyboardTracking() {
  useEffect(() => subscribeVirtualKeyboard(noop), []);
}

/** 키보드가 레이아웃 뷰포트 아래쪽을 가린 높이(px). CSS 에서는 bottom-keyboard-inset 을 쓴다 */
export function useKeyboardInset() {
  return useSyncExternalStore(subscribeVirtualKeyboard, getKeyboardInset, getKeyboardInset);
}

/** 키보드가 열려 있는지. Android(레이아웃이 줄어드는 경우)도 포함한다 */
export function useIsKeyboardOpen() {
  return useSyncExternalStore(subscribeVirtualKeyboard, getIsKeyboardOpen, getIsKeyboardOpen);
}

/**
 * 화면 하단을 가리는 고정 요소로 등록하고 그 높이(px)를 돌려준다.
 * 등록된 높이만큼 포커스된 입력창이 위로 비켜 올라간다.
 */
export function useBottomObstruction(ref: RefObject<HTMLElement>, enabled = true) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const observer = new ResizeObserver(() => {
      const next = Math.round(element.getBoundingClientRect().height);
      setHeight(next);
      setBottomObstruction(element, next);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      removeBottomObstruction(element);
    };
  }, [ref, enabled]);

  return height;
}

/** 등록된 하단 고정 요소(하단 버튼 · 고정 바) 중 가장 높은 것의 높이(px). 없으면 0 */
export function useBottomObstructionHeight() {
  return useSyncExternalStore(
    subscribeBottomObstruction,
    getBottomObstructionHeight,
    getBottomObstructionHeight,
  );
}
