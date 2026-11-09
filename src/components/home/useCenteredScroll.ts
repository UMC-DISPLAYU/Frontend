import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 가로 스냅 목록에서 화면 가운데에 가장 가까운 자식의 인덱스를 추적한다.
 * 목록 요소는 relative 여야 한다(자식 offsetLeft 기준).
 */
export function useCenteredScroll<T extends HTMLElement>(itemCount: number) {
  const ref = useRef<T>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // 새로 그린 목록(탭 전환 등)은 한 프레임 동안 강조 없이 그린 뒤 강조한다.
  // 프로토타입처럼 글자 색 · 순위 · 열 밝기가 전환 애니메이션으로 나타나게 하려는 것이다
  useEffect(() => {
    // 강조 전 모습이 먼저 계산돼 있어야 클래스가 바뀔 때 전환이 실행된다
    void ref.current?.offsetWidth;
    const frame = requestAnimationFrame(() => setIsRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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

  /** 강조(글자 색 · 순위 · 열 밝기)용 인덱스. 처음 한 프레임은 -1 이다 */
  const highlightIndex = isRevealed ? activeIndex : -1;

  return { ref, activeIndex, highlightIndex, scrollToIndex };
}
