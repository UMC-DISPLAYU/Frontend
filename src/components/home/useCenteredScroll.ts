import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 가로 스냅 목록에서 화면 가운데에 가장 가까운 자식의 인덱스를 추적한다.
 * 목록 요소는 relative 여야 한다(자식 offsetLeft 기준).
 */
export function useCenteredScroll<T extends HTMLElement>(itemCount: number) {
  const ref = useRef<T>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;

    let frame = 0;
    const update = () => {
      const center = list.scrollLeft + list.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Infinity;
      Array.from(list.children).forEach((child, index) => {
        const { offsetLeft, offsetWidth } = child as HTMLElement;
        const distance = Math.abs(offsetLeft + offsetWidth / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });
      setActiveIndex(nearest);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    list.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener('scroll', onScroll);
    };
  }, [itemCount]);

  const scrollToIndex = useCallback((index: number) => {
    const list = ref.current;
    const child = list?.children[index] as HTMLElement | undefined;
    if (!list || !child) return;

    // JS 스크롤은 index.css 의 동작 줄이기 규칙이 닿지 않아 직접 확인한다
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({
      left: child.offsetLeft + child.offsetWidth / 2 - list.clientWidth / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, []);

  return { ref, activeIndex, scrollToIndex };
}
