import { useEffect } from 'react';

/* 페이지 스크롤 바운스는 html·body에 걸리므로, 이 화면에 있는 동안만 끄고 나갈 때 되돌립니다. */
export function useDisablePageBounce() {
  useEffect(() => {
    const roots = [document.documentElement, document.body];
    const previousValues = roots.map((root) => root.style.overscrollBehaviorY);

    roots.forEach((root) => {
      root.style.overscrollBehaviorY = 'none';
    });
    return () => {
      roots.forEach((root, index) => {
        root.style.overscrollBehaviorY = previousValues[index];
      });
    };
  }, []);
}
