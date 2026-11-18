import { useState } from 'react';

import { isDesktopViewport } from './artworkDetail.utils';

export type ViewMode = 'one' | 'stack';

const VIEW_MODE_STORAGE_KEY = 'du.view';

/* 이 기기에서 직접 고른 방식이 있으면 그것을, 없으면 900px 이상은 이어서 보기 · 미만은 한 장씩 보기 */
export const getInitialViewMode = (stored: string | null, isDesktop: boolean): ViewMode => {
  if (stored === 'one' || stored === 'stack') return stored;
  return isDesktop ? 'stack' : 'one';
};

const readInitialViewMode = (): ViewMode => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 화면 폭 기준 기본값을 쓴다
  }
  return getInitialViewMode(stored, isDesktopViewport());
};

/* 고른 감상 방식은 이 기기에 기억한다 */
export function useViewMode() {
  const [storedMode, setStoredMode] = useState<ViewMode>(readInitialViewMode);

  const changeMode = (mode: ViewMode) => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // 저장소를 쓸 수 없는 환경에서는 이번 방문에만 적용된다
    }
    setStoredMode(mode);
  };

  return [storedMode, changeMode] as const;
}
