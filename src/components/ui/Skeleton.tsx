import { Fragment, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/**
 * 불러오는 중인 자리. 실제 콘텐츠와 같은 크기 · 비율 · 모서리를 className 으로 준다.
 * 예: `<Skeleton className="aspect-3/4 rounded-12" />`, `<Skeleton className="h-5 w-2/3 rounded-4" />`
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('skeleton-shimmer', className)} {...props} />;
}

interface SkeletonListProps {
  count: number;
  /** 카드 하나 모양의 스켈레톤. index 를 받아 마지막 줄만 다르게 그리는 등에 쓴다 */
  children: (index: number) => ReactNode;
}

/** 카드 스켈레톤을 count 개 반복한다. 감싸는 그리드 · 목록은 실제 목록과 같은 것을 쓴다 */
export function SkeletonList({ count, children }: SkeletonListProps) {
  return (
    <>
      {Array.from({ length: Math.max(0, count) }, (_, index) => (
        <Fragment key={index}>{children(index)}</Fragment>
      ))}
    </>
  );
}
