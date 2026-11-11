import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 선택된 탭(aria-selected) 아래 밑줄 하나가 탭에서 탭으로 미끄러지도록 위치 · 폭을 잰다.
 * listRef 를 단 tablist 는 relative 여야 한다(탭 offsetLeft 기준). 처음 자리를 잡을 때는 움직이지 않는다
 */
export function useTabIndicator<T extends HTMLElement>(activeTab: string) {
  const listRef = useRef<T>(null);
  const [indicator, setIndicator] = useState<{ x: number; width: number; animate: boolean }>();

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return;
      setIndicator((prev) => ({
        x: tab.offsetLeft,
        width: tab.offsetWidth,
        animate: prev !== undefined,
      }));
    };
    measure();
    // 글꼴이 늦게 들어와 탭 폭이 바뀌어도 맞춘다
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeTab]);

  return { listRef, indicator };
}
