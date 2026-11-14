import { Fragment, type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';

import { cn } from '@/utils/cn';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * 불러오는 중인 회색 칸(사진 · 버튼 · 입력창 같은 덩어리). 실제 콘텐츠와 같은 크기 · 비율 · 모서리를 className 으로 준다.
 * 글자 자리는 SkeletonText 를 쓴다.
 * 예: `<Skeleton className="aspect-3/4 w-full" />`, `<Skeleton className="h-11 rounded-12" />`
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={cn(className, 'skeleton')} {...props} />;
}

/**
 * 글자 한 줄 자리. 실제 글자와 같은 typography 클래스를 주면 줄 높이가 같아지고,
 * 그 줄 가운데에 10px 막대가 그려진다(디자인 LOADING-SPEC 11-14). 폭은 w-* 로, 가운데 정렬 글자는 mx-auto 로 맞춘다.
 * 예: `<SkeletonText className="typography-body-lg-medium w-2/3" />`
 */
export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative before:absolute before:inset-x-0 before:inset-y-0 before:my-auto before:h-2.5 before:skeleton',
        className,
      )}
      {...props}
    >
      {/* 글자가 있어야 typography 의 줄 높이만큼 높이가 생긴다 */}
      {' '}
    </div>
  );
}

interface SkeletonListProps {
  count: number;
  /**
   * 카드 하나 모양의 스켈레톤. 카드마다 요소 하나를 돌려준다(물결 순서를 그 요소에 넣는다).
   * index 를 받아 마지막 줄만 다르게 그리는 등에 쓴다
   */
  children: (index: number) => ReactNode;
}

/**
 * 카드 스켈레톤을 count 개 반복한다. 감싸는 그리드 · 목록은 실제 목록과 같은 것을 쓴다.
 * 실제 배치에서 열 수를 재 칸마다 (열 + 행) 순서를 넣어, 왼쪽 위에서 오른쪽 아래로 숨쉬기가 번지게 한다.
 */
export function SkeletonList({ count, children }: SkeletonListProps) {
  const total = Math.max(0, count);
  const markerRef = useRef<HTMLTemplateElement>(null);

  // 회색 칸은 처음 150ms 동안 보이지 않으므로 그려진 뒤(useEffect)에 순서를 넣어도 늦지 않다
  useEffect(() => {
    const marker = markerRef.current;
    const parent = marker?.parentElement;
    if (!marker || !parent) return;

    // 카드들은 Fragment 라 ref 를 달 수 없어, 바로 앞에 둔 template 의 뒤 형제 요소를 카드로 센다.
    // template 을 맨 뒤에 두면 space-y · divide-y(:not(:last-child))가 마지막 카드에도 붙는다
    const items: HTMLElement[] = [];
    for (let el = marker.nextElementSibling; el && items.length < total; ) {
      if (el instanceof HTMLElement) items.push(el);
      el = el.nextElementSibling;
    }

    const applyWave = () => {
      if (!items.length) return;
      const firstTop = items[0].offsetTop;
      const columns = Math.max(1, items.filter((el) => el.offsetTop === firstTop).length);
      items.forEach((el, index) => {
        el.style.setProperty(
          '--skeleton-wave',
          String((index % columns) + Math.floor(index / columns)),
        );
      });
    };

    applyWave();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(applyWave);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [total]);

  return (
    <>
      <template ref={markerRef} />
      {Array.from({ length: total }, (_, index) => (
        <Fragment key={index}>{children(index)}</Fragment>
      ))}
    </>
  );
}
