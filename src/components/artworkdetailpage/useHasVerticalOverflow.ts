import { type RefObject, useEffect, useState } from 'react';

/* 요소 자체의 크기는 그대로인 채 안쪽 내용만 늘어날 수 있어 자식 크기도 함께 관찰합니다. */
export function useHasVerticalOverflow(ref: RefObject<HTMLElement>) {
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setHasOverflow(element.scrollHeight > element.clientHeight);
    });
    observer.observe(element);
    Array.from(element.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [ref]);

  return hasOverflow;
}
