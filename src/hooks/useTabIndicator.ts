import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 선택된 탭(aria-selected) 아래 밑줄 하나가 탭에서 탭으로 미끄러지도록 위치 · 폭을 잰다.
 * listRef 를 단 tablist 는 relative 여야 한다(탭 offsetLeft 기준).
 * 탭을 바꿀 때만 미끄러지고, 처음 자리를 잡거나 크기가 바뀌어 다시 잴 때는 바로 옮긴다
 */
export function useTabIndicator<T extends HTMLElement>(activeTab: string) {
  const listRef = useRef<T>(null);
  const [indicator, setIndicator] = useState<{ x: number; width: number; animate: boolean }>();

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = (isTabChange: boolean) => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return;
      const { offsetLeft: x, offsetWidth: width } = tab;
      setIndicator((prev) =>
        prev?.x === x && prev.width === width
          ? prev
          : { x, width, animate: isTabChange && prev !== undefined },
      );
    };
    measure(true);
    // 글꼴이 늦게 들어오면 tablist 크기는 그대로인 채 탭의 폭 · 위치만 바뀐다. 그래서 탭도 하나씩 지켜본다
    const observer = new ResizeObserver(() => measure(false));
    observer.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  }, [activeTab]);

  return { listRef, indicator };
}
