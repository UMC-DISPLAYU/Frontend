import { useState } from 'react';

export type ViewMode = 'one' | 'stack';

const VIEW_MODE_STORAGE_KEY = 'du.view';

const readStoredViewMode = (): ViewMode => {
  try {
    return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'stack' ? 'stack' : 'one';
  } catch {
    return 'one';
  }
};

/* 고른 감상 방식은 이 기기에 기억한다. 사진이 한 장이면 늘 한 장씩 */
export function useViewMode(hasMultiple: boolean) {
  const [storedMode, setStoredMode] = useState<ViewMode>(readStoredViewMode);

  const changeMode = (mode: ViewMode) => {
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // 저장소를 쓸 수 없는 환경에서는 이번 방문에만 적용된다
    }
    setStoredMode(mode);
  };

  return [hasMultiple ? storedMode : 'one', changeMode] as const;
}
