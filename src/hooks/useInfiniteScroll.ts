import { useEffect, useState } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0.1,
  rootMargin = '0px',
}: UseInfiniteScrollProps) {
  // 콜백 ref 로 받아, 스켈레톤이 끝난 뒤처럼 센티널이 늦게 붙어도 옵저버를 연결한다
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [el, hasNextPage, isFetchingNextPage, fetchNextPage, threshold, rootMargin]);

  return setEl;
}
