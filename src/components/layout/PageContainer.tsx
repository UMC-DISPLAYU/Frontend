import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type PageContainerVariant = 'form' | 'list';

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  /** form: 입력 화면(등록 · 수정, 최대 672px) / list: 목록 · 관리 화면(최대 1160px) */
  variant: PageContainerVariant;
  /** 화면 높이(dvh)를 채운다. 하단 버튼을 화면 아래에 붙여야 하는 입력 화면용. 기본값: form 만 true */
  fillHeight?: boolean;
  children: ReactNode;
};

const MAX_WIDTH_CLASS: Record<PageContainerVariant, string> = {
  form: 'tablet:max-w-form',
  list: 'tablet:max-w-list',
};

/**
 * 페이지 바깥 틀. 모바일은 전체 폭, 태블릿 · 데스크톱은 최대 폭에서 가운데 정렬하고
 * 좌우 여백(px-gutter)과 상단 safe area 를 둔다. 최대 폭은 좌우 여백을 포함한 값이다.
 */
export function PageContainer({
  variant,
  fillHeight = variant === 'form',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col px-gutter pt-safe-area-top tablet:pt-10',
        MAX_WIDTH_CLASS[variant],
        fillHeight && 'min-h-dvh',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
