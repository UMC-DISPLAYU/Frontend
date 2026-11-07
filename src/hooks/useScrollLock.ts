import { useEffect } from 'react';

import { lockScroll } from '@/utils/scrollLock';

/** active 인 동안 뒤 페이지(window) 스크롤을 잠근다. 여러 곳에서 동시에 써도 안전하다 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return lockScroll();
  }, [active]);
}
