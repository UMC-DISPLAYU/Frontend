import { type RefObject, useEffect, useState } from 'react';

/** CSS로 정한 높이(dvh·safe area 포함)를 JS 계산에 쓰려고 실제 요소 높이를 구독한다 */
export function useElementHeight(ref: RefObject<HTMLElement | null>, fallback: number) {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return height ?? fallback;
}
